class AppState {
  final bool loading;

  final String? token;

  final bool login;

  const AppState({this.loading = false, this.token, this.login = false});

  AppState copyWith({bool? loading, String? token, bool? login}) {
    return AppState(
      loading: loading ?? this.loading,

      token: token ?? this.token,

      login: login ?? this.login,
    );
  }
}
