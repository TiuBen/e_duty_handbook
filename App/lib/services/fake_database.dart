// lib/database/fake_database.dart
import '../models/InfoItem.dart';

class FakeDatabaseService {
  // 移除所有数据库相关的逻辑，只返回模型初始化的数据
  static List<Category> getInitialCategories() {
    final user1 = User(id: "user1", name: "Alice");
    final user2 = User(id: "user2", name: "Bob");
    final user3 = User(id: "user3", name: "Charlie");

    final navDeviceCat = Category(name: '导航设备');
    final lightDeviceCat = Category(name: '灯光设备');
    final noticeCat = Category(name: '航行通告');
    final dynamicCat = Category(name: '当前动态');

    navDeviceCat.addItem(
      Item(
        id: "item1",
        content: "GPS信号弱",
        creator: user1,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
    );

    navDeviceCat.addItem(
      Item(
        id: "item2",
        content: "航向传感器异常",
        creator: user2,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
    );

    lightDeviceCat.addItem(
      Item(
        id: "item3",
        content: "前灯亮度不足",
        creator: user1,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
    );

    final confirmedItem = Item(
      id: "item4",
      content: "信号灯闪烁",
      creator: user3,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    );
    confirmedItem.addConfirmer(user1);
    confirmedItem.addConfirmer(user2);
    lightDeviceCat.addItem(confirmedItem);

    noticeCat.addItem(
      Item(
        id: "item5",
        content: "前方海域有强风警报",
        creator: user2,
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
    );

    dynamicCat.addItem(
      Item(
        id: "item6",
        content: "风速 15 节",
        creator: user1,
        createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
      ),
    );

    dynamicCat.addItem(
      Item(
        id: "item7",
        content: "水深 12.5 米",
        creator: user3,
        createdAt: DateTime.now(),
      ),
    );

    return [navDeviceCat, lightDeviceCat, noticeCat, dynamicCat];
  }

  // 模拟异步加载
  static Future<List<Category>> getAllCategoriesWithItems() async {
    await Future.delayed(const Duration(milliseconds: 500)); // 模拟网络延迟
    return getInitialCategories();
  }
}
