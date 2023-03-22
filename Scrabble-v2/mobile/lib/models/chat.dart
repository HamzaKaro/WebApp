class Message {
  final String text;
  final String destination;
  final String sender;
  final String email;
  final String avatar;

  const Message({
    required this.text,
    required this.sender,
    required this.destination,
    required this.email,
    required this.avatar,
  });

  Map<String, dynamic> toJSON() => {
        'text': text,
        'sender': sender,
        'email': email,
        'avatar': avatar,
        'destination': destination,
      };

  factory Message.fromJSONSingle(Map<String, dynamic> json) => Message(
        text: json['text'],
        sender: json['sender'],
        email: json['email'],
        avatar: json['avatar'],
        destination: json['destination'],
      );
}

class Conversation {
  final String name;
  final String creator;
  final bool isPublic;
  final bool canBeDeleted;
  final bool canBeLeft;
  final String displayName;
  final List<Message> messages;
  DateTime lastActive = DateTime.now();

  Conversation({
    required this.name,
    required this.messages,
    required this.isPublic,
    required this.creator,
    required this.canBeDeleted,
    required this.canBeLeft,
    required this.displayName,
  });

  factory Conversation.fromJSON(Map<String, dynamic> json) {
    return Conversation(
      name: json['name'],
      messages: json['messages'] ?? [],
      isPublic: json['isPublic'] ?? true,
      creator: json['creator'] ?? "",
      canBeDeleted: json['canBeDeleted'] ?? true,
      canBeLeft: json['canBeDeleted'] ?? true,
      displayName: json['displayName'] ?? json['name'],
    );
  }
}

class Channel {
  final String name;

  Channel({
    required this.name,
  });

  factory Channel.fromJSON(Map<String, dynamic> json) {
    return Channel(name: json['name']);
  }
}
