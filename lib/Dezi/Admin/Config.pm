package Dezi::Admin::Config;
use strict;
use warnings;
use Carp;
use Dezi::Admin::UI;
use Dezi::Admin::About;
use Dezi::Admin::API;
use Class::Inspector;
use Path::Class;
use Plack::Util::Accessor qw(
    debug
    authenticator
    auth_realm
    ui_server
    api_server
    about_server
);

our $VERSION = '0.001';

=head1 NAME

Dezi::Admin::Config - Dezi administration UI configuration

=head1 SYNOPSIS

=head1 DESCRIPTION

=head1 METHODS

=cut

=head2 new( I<config> )

Returns a new Config object. I<config> should be a hashref with keys
including:

=over

=item username

=item password

=item auth_realm

=item debug

=back

=cut

sub new {
    my $class = shift;
    my $args = shift || {};
    $args->{debug} = 0 unless defined $args->{debug};
    $args->{username} or carp "WARNING: username missing - no auth enforced";
    $args->{password} or carp "WARNING: password missing - no auth enforced";
    $args->{auth_realm} ||= 'Dezi Admin';

    $args->{authenticator} = sub {
        my ( $u, $p ) = @_;
        return $u eq $args->{username} && $p eq $args->{password};
    };

    $args->{ui_server}    = Dezi::Admin::UI->new()->to_app();
    $args->{about_server} = Dezi::Admin::About->new()->to_app();    # TODO
    $args->{api_server}   = Dezi::Admin::API->new()->to_app();

    return bless $args, $class;
}

=head2 authenticator

The authenticator() method will return a CODE ref for passing
to L<Plack::Middleware::Auth::Basic>.

=cut

=head2 ui_server

Returns an instance of Dezi::Admin::UI.

=head2 ui_static_path

File path to where static assets are stored. These include .css
and .js files.

=cut

sub ui_static_path {
    my $self = shift;
    my $base = Class::Inspector->loaded_filename('Dezi::Admin::UI');
    $base =~ s/\.pm$//;
    return dir( $base, 'static' );
}

=head2 api_server

Returns an instance of Dezi::Admin::API.

=head2 about_server

Returns an instance of Dezi::Admin::About.

=head2 as_hash

Returns the object as a plain Perl hash of key/value pairs.

=cut

sub as_hash {
    my $self = shift;
    return %$self;
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
