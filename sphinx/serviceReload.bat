chcp 1251
%~dp0bin\searchd.exe --servicename Sphinx --delete
%~dp0bin\searchd.exe --install --config %~dp0sphinx.conf --servicename Sphinx
@pause