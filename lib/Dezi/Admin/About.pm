package Dezi::Admin::About;
use strict;
use warnings;
use Carp;
use base qw( Plack::Middleware );
use Plack::Request;
use Data::Dump qw( dump );

our $VERSION = '0.001';

=head1 NAME

Dezi::Admin::About - Dezi administration UI home page

=head1 SYNOPSIS

=head1 DESCRIPTION

=head1 METHODS

=head2 default_page

Returns the HTML string suitable for the main UI. It uses
the jQuery-based examples from dezi.org.

=cut

sub default_page {
    return <<EOF;
<html>
 <head>
  <title>Dezi Admin</title>
  <link rel="stylesheet" type="text/css" href="ui/static/css/dezi-admin.css" />
  <link rel="stylesheet" type="text/css" href="//cdn.sencha.io/ext-4.1.1-gpl/resources/css/ext-all.css" />
  <script type="text/javascript" charset="utf-8" src="//cdn.sencha.io/ext-4.1.1-gpl/ext-all.js"></script>
  <script type="text/javascript" charset="utf-8" src="ui/static/js/dezi-admin.js"></script>
 </head>
 <body>
  <h1>Dezi Administration</h1>
  
 </body>
</html>
EOF

}

=head2 call( I<env> )

Implements the required Middleware method. GET requests
are the only allowed interface.

=cut

sub call {
    my ( $self, $env ) = @_;
    my $req  = Plack::Request->new($env);
    my $resp = $req->new_response;

    # enforce trailing slash so relative links work
    if ( !$req->path_info ) {
        $resp->redirect( $req->uri . '/', 301 );    # permanent
    }
    elsif ( $req->method eq 'GET' ) {
        $resp->status(200);
        $resp->content_type('text/html');
        my $body = $self->default_page;
        $resp->body($body);
    }
    else {
        $resp->status(400);
        $resp->body('GET only allowed');
    }
    return $resp->finalize;
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
