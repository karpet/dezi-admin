package Dezi::Admin::API;
use strict;
use warnings;
use Carp;
use Plack::Builder;
use Data::Dump qw( dump );
use Plack::Util::Accessor qw(
    debug
    base_uri
);
use JSON;
use Dezi::Admin::API::Indexes;

our $VERSION = '0.001';

=head1 NAME

Dezi::Admin::API - Dezi administration API

=head1 SYNOPSIS

=head1 DESCRIPTION

=head1 METHODS

=cut

sub app {
    my $self    = shift;
    my %configs = @_;

    #dump \%configs;

    my $config = delete $configs{dezi_config}
        or croak "Dezi::Config required";
    my $search_config = delete $configs{search_config}
        or croak "search_config required";
    my $admin_config = $config->{admin}
        or croak "Dezi::Admin::Config key required";

    my @indexes = @{ $search_config->{index} };
    my $type    = $search_config->{type};
    my @models;
    my $stats_app;
    if (    $config->{stats_logger}
        and $config->{stats_logger}->isa('Dezi::Stats::DBI') )
    {
        require Dezi::Admin::API::Stats;
        my $conn = $config->{stats_logger}->conn;
        my $tbl  = $config->{stats_logger}->table_name;
        $stats_app = {
            get => Dezi::Admin::API::Stats::GET->new(
                conn       => $conn,
                table_name => $tbl,
                )->to_app(),
            list => Dezi::Admin::API::Stats::LIST->new(
                conn       => $conn,
                table_name => $tbl,
                )->to_app(),
            pass_through => 0,
        };
        push @models, 'stats';
    }

    return builder {

        enable "SimpleLogger",
            level => $admin_config->debug ? "debug" : "warn";

        enable_if { $_[0]->{REMOTE_ADDR} eq '127.0.0.1' }
        "Plack::Middleware::ReverseProxy";

        enable "Auth::Basic",
            authenticator => $admin_config->authenticator,
            realm         => $admin_config->auth_realm;

        # index meta
        mount '/indexes' => builder {
            enable 'REST',
                get =>
                Dezi::Admin::API::Indexes::GET->new( indexes => \@indexes )
                ->to_app(),
                list =>
                Dezi::Admin::API::Indexes::LIST->new( indexes => \@indexes )
                ->to_app(),
                pass_through => 0;
        };

        # Dezi::Stats
        if ($stats_app) {

            mount '/stats' => builder {
                enable 'REST', %$stats_app;
            };
        }

        # About page
        mount '/' => builder {
            sub {
                my $req   = Plack::Request->new(shift);
                my $resp  = $req->new_response();
                my $about = {
                    name    => $self,
                    version => $VERSION,
                    models  => \@models,
                    indexes => \@indexes,
                    type    => $type,
                };
                $resp->body( to_json($about) );
                $resp->status(200);
                $resp->content_type('application/json');
                return $resp->finalize();
            };
        };

    };

}

1;

__END__

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
