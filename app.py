p   from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app)

# Store connected users
online_users = set()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in online_users:
        online_users.remove(request.sid)
        emit('user_left', {'timestamp': datetime.now().strftime('%H:%M')}, broadcast=True)

@socketio.on('join')
def handle_join(data):
    nickname = data.get('nickname')
    if nickname and request.sid not in online_users:
        online_users.add(request.sid)
        emit('user_joined', {
            'nickname': nickname,
            'timestamp': datetime.now().strftime('%H:%M')
        }, broadcast=True)
        # Send current online users to the new user
        emit('update_users', {'users': list(online_users)})

@socketio.on('message')
def handle_message(data):
    nickname = data.get('nickname')
    message = data.get('message')
    if nickname and message:
        emit('new_message', {
            'nickname': nickname,
            'message': message,
            'timestamp': datetime.now().strftime('%H:%M')
        }, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
