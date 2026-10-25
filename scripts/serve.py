"""Local static preview with enough connection capacity for browser QA."""
import argparse
import http.server
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4180)
parser.add_argument('--directory', default=str(Path(__file__).resolve().parent.parent))
args = parser.parse_args()

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *handler_args, **kwargs):
        super().__init__(*handler_args, directory=args.directory, **kwargs)
    def log_message(self, *args):
        pass

http.server.ThreadingHTTPServer.request_queue_size = 128
server = http.server.ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
print(f'Serving {Path(args.directory).resolve()} at http://127.0.0.1:{args.port}/', flush=True)
server.serve_forever()
