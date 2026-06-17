class User {
  final int id;
  final String username;
  final String phonenumber;

  User({required this.id, required this.username, required this.phonenumber});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      username: json['username'] as String,
      phonenumber: json['phonenumber'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'username': username, 'phonenumber': phonenumber};
  }
}
