from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def boats_get_post():
    if request.method == 'POST':
        return ('POST received!')
    if request.method == 'GET':
        return ('Hello, World!')
	else:
		return ('Not supported', 406)