package Dezi::Admin;
use strict;
use warnings;
use Carp;
use Plack::Builder;
use Dezi::Admin::Config;

our $VERSION = '0.001';

=head1 NAME

Dezi::Admin - Dezi server administration UI

=head1 SYNOPSIS


=head1 DESCRIPTION

Dezi::Admin is a Plack middleware that creates an administration
web interface to a Dezi server.

=head1 METHODS

=head2 app( I<config> )

Returns a Plack-ready application via Plack::Builder.

=cut

sub app {
    my ( $class, $config ) = @_;

    my $admin_config = Dezi::Admin::Config->new(%$config);

    return builder {

        enable "SimpleLogger",
            level => $admin_config->debug ? "debug" : "warn";

        enable_if { $_[0]->{REMOTE_ADDR} eq '127.0.0.1' }
        "Plack::Middleware::ReverseProxy";

        # HTML/Javascript
        mount '/ui' => builder {
            enable "Auth::Basic",
                authenticator => $admin_config->authenticator,
                realm         => $admin_config->auth_realm;
            $admin_config->ui_server;
        };

        # REST API
        mount '/api' => builder {
            enable "Auth::Basic",
                authenticator => $admin_config->authenticator,
                realm         => $admin_config->auth_realm;
            $admin_config->api_server;
        };

        # root is About page
        mount '/' => $admin_config->about_server;

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
