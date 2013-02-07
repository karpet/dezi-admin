package Dezi::Admin::API::Stats;
use strict;
use warnings;
use Carp;
use base qw( Plack::Component );
use Data::Dump qw( dump );
use Plack::Util::Accessor qw(
    debug
    conn
    table_name
);
use JSON;
use Plack::Middleware::REST::Util;
use Dezi::Admin::Utils;
use Dezi::Admin::API::Response;

our $VERSION = '0.001';

our @FIELDS = (
    'id',
    {   name       => 'tstamp',
        type       => 'date',
        dateFormat => 'timestamp',
    },
    'q',
    'build_time',
    'search_time',
    'remote_user',
    'path',
    { name => 'total', type => 'int' },
    's', 'o', 'p', 'h',
    { name => 'c', type => 'boolean' },
    'L',
    { name => 'f', type => 'boolean' },
    { name => 'r', type => 'boolean' },
    't', 'b',
);

sub get_list {
    my ( $self, $req ) = @_;
    my $list  = [];
    my $total = 0;
    my %sql   = Dezi::Admin::Utils::params_to_sql( $req, $self->table_name,
        [ 'q', 'remote_user', 'path' ] );

    #dump \%sql;

    $self->conn->run(
        sub {
            my $dbh = $_;
            my $sth = $dbh->prepare( $sql{sql} );
            $sql{args} ? $sth->execute( @{ $sql{args} } ) : $sth->execute();
            while ( my $row = $sth->fetchrow_hashref ) {
                push @$list, $row;
            }
            $sth = $dbh->prepare( $sql{count} );
            $sql{args} ? $sth->execute( @{ $sql{args} } ) : $sth->execute();
            $total = $sth->fetch->[0];
        }
    );

    my $resp = Dezi::Admin::API::Response->new(
        total   => $total,
        results => $list,

    );
    $resp->metaData->{fields}   = [@FIELDS];
    $resp->metaData->{sortInfo} = {
        direction => $sql{direction},
        field     => $sql{sort},
    };
    $resp->metaData->{limit} = $sql{limit};
    $resp->metaData->{start} = $sql{offset};

    return $resp;
}

sub get_stat {
    my ( $self, $req ) = @_;
    my $id = request_id( $req->env );

    # TODO

    return Dezi::Admin::API::Response->new();
}

sub get_terms {
    my ( $self, $req ) = @_;

    my $list  = [];
    my $total = 0;
    my %sql
        = Dezi::Admin::Utils::params_to_sql( $req, $self->table_name, ['q'] );

    #dump \%sql;

    $self->conn->run(
        sub {
            my $dbh = $_;
            my $sth = $dbh->prepare( $sql{sql} );
            $sql{args} ? $sth->execute( @{ $sql{args} } ) : $sth->execute();
            while ( my $row = $sth->fetchrow_hashref ) {
                push @$list, $row;
            }
            $sth = $dbh->prepare( $sql{count} );
            $sql{args} ? $sth->execute( @{ $sql{args} } ) : $sth->execute();
            $total = $sth->fetch->[0];
        }
    );

    my $resp = Dezi::Admin::API::Response->new(
        total   => $total,
        results => $list,

    );
    $resp->metaData->{fields}   = [@FIELDS];
    $resp->metaData->{sortInfo} = {
        direction => $sql{direction},
        field     => $sql{sort},
    };
    $resp->metaData->{limit} = $sql{limit};
    $resp->metaData->{start} = $sql{offset};

    return $resp;

}

my %dispatch = (
    '/'      => 'get_list',
    '/terms' => 'get_terms',
);

sub call {
    my ( $self, $env ) = @_;
    my $req    = Plack::Request->new($env);
    my $resp   = $req->new_response;
    my $path   = $req->path;
    my $method = $dispatch{$path} || undef;
    if ( !$method ) {
        $resp->status(404);
        $resp->body( encode_json( { msg => 'Resource not found' } ) );
    }
    else {
        my $api_resp = $self->$method($req);
        $resp->body($api_resp);
    }

    $resp->status(200) unless $resp->status;
    $resp->content_type(Dezi::Admin::Utils::json_mime_type)
        unless $resp->content_type;

    return $resp->finalize;
}

1;

__END__

=head1 NAME

Dezi::Admin::API::Stats - Dezi administration API to Dezi::Stats data

=head1 SYNOPSIS

 /api/stats?q=foo&sort=name&dir=asc&limit=10&offset=0

=head1 DESCRIPTION

Dezi::Admin::API::Stats isa L<Plack::Component>.

=head1 METHODS

=head2 get_list

Returns L<Dezi::Admin::API::Response> object representing metadata for
one or more statistics matching GET params.

=head2 get_stat

Returns L<Dezi::Admin::API::Response> object for a single statistic.

=head2 get_terms

Returns L<Dezi::Admin::API::Response> object representing
the top I<N> search terms.

=head2 call( I<env> )

Required method that dispatches request.

=head1 AUTHOR

Peter Karman, C<< <karman at cpan.org> >>

=head1 BUGS

Please report any bugs or feature requests to C<bug-dezi-admin at rt.cpan.org>, or through
the web interface at L<http://rt.cpan.org/NoAuth/ReportBug.html?Queue=Dezi-Admin>.  I will be notified, and then you'll
automatically be notified of progress on your bug as I make changes.

=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc Dezi::Admin


You can also look for information at:

=over 4

=item * RT: CPAN's request tracker

L<http://rt.cpan.org/NoAuth/Bugs.html?Dist=Dezi-Admin>

=item * AnnoCPAN: Annotated CPAN documentation

L<http://annocpan.org/dist/Dezi-Admin>

=item * CPAN Ratings

L<http://cpanratings.perl.org/d/Dezi-Admin>

=item * Search CPAN

L<http://search.cpan.org/dist/Dezi-Admin/>

=back

=head1 COPYRIGHT & LICENSE

Copyright 2013 Peter Karman.

This program is free software; you can redistribute it and/or modify it
under the terms of either: the GNU General Public License as published
by the Free Software Foundation; or the Artistic License.

See http://dev.perl.org/licenses/ for more information.


=cut
