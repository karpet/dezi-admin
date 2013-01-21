package Dezi::Admin::API::Response;
use strict;
use warnings;
use overload
    '""'     => sub { $_[0]->stringify; },
    'bool'   => sub {1},
    fallback => 1;
use JSON;
use Plack::Util::Accessor qw(
    total
    success
    results
    metaData
);

sub new {
    my $class = shift;
    my %args  = @_;

    my $self = {
        success  => 1,
        metaData => {
            successProperty => 'success',
            totalProperty   => 'total',
            sortInfo        => {},
            fields          => [],
            idProperty      => 'id',
            root            => 'results',
            limit           => 50,
            start           => 0,
        },
        %args,
    };

    return bless $self, $class;
}

sub stringify {
    my $self = shift;
    return to_json( {%$self} );
}

1;
