chcp 65001
%~dp0bin\indexer.exe --all --config %~dp0sphinx.conf --rotate --print-queries
%~dp0bin\searchd.exe --config %~dp0sphinx.conf --console
@pause