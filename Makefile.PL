use strict;
use warnings;
use inc::Module::Install;
use 5.008003;

name 'Dezi-Admin';
all_from 'lib/Dezi/Admin.pm';
requires 'Test::More'                       => 0;
requires 'SWISH::Prog'                      => 0.69;
requires 'SWISH::Prog::Lucy'                => 0.14;
requires 'Search::OpenSearch::Engine::Lucy' => 0.16;
requires 'Dezi'                             => 0.002007;
requires 'Plack'                            => 0;
requires 'Plack::Middleware::ReverseProxy'  => 0;
requires 'Plack::Middleware::Auth::Basic'   => 0;
requires 'Plack::Middleware::REST'          => 0;

perl_version '5.8.9';
license 'http://dev.perl.org/licenses/';
homepage 'https://github.com/karpet/dezi-admin';
bugtracker 'http://rt.cpan.org/NoAuth/Bugs.html?Dist=Dezi-Admin';
repository 'http://github.com/karpet/dezi-admin';

WriteMakefile(
    PL_FILES => {},
    dist     => { COMPRESS => 'gzip -9f', SUFFIX => 'gz', },
    clean => { FILES => 't/test.index Dezi-Admin* dezi.index' },
);

