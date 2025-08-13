import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'screens/reader_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  runApp(const MangaReaderApp());
}

class MangaReaderApp extends StatelessWidget {
  const MangaReaderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MangaReader AR',
      themeMode: ThemeMode.dark,
      theme: ThemeData(
        colorScheme: const ColorScheme.dark().copyWith(
          primary: Colors.teal,
          secondary: Colors.tealAccent,
        ),
        useMaterial3: true,
        brightness: Brightness.dark,
        fontFamily: 'Roboto',
      ),
      debugShowCheckedModeBanner: false,
      builder: EasyLoading.init(),
      home: const Directionality(
        textDirection: TextDirection.rtl,
        child: ReaderScreen(),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MangaReader AR'),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'مفتاح OpenAI مضبوط: ${dotenv.env['OPENAI_API_KEY']?.isNotEmpty == true ? 'نعم' : 'لا'}',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text('ابدأ بإضافة مصدر مانجا وترجمة الصور'),
          ],
        ),
      ),
    );
  }
}
