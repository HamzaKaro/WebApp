import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart';

final String serverUrl = dotenv.get('SERVER_URL');

class SocketService {
  late Socket socket;

  void connect() {
    socket = io(serverUrl, {
      'autoConnect': true,
      'transports': ['websocket'],
      'reconnection': true,
      'upgrade': false
    });
    socket.connect();
  }

  isSocketAlive() {
    return socket.connected;
  }

  void disconnect() {
    socket.disconnect();
  }

  on<T>(String event, Function(dynamic) callback) {
    if (isSocketAlive()) {
      connect();
    }

    socket.on(event, callback);
  }

  send<T>(String event, dynamic data) {
    if (!isSocketAlive()) {
      connect();
    }

    if (data != null) {
      socket.emit(event, data);
    } else {
      socket.emit(event);
    }
  }

  authentify(String email) {
    socket.emit('authentify', email);
  }
}
