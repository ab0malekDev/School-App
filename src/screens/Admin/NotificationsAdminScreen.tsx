// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
import { API_URL } from '@env';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

const NOTIFICATIONS_URL = `${API_URL}/notifications`;

interface Notification {
  id: number;
  title: string;
  body: string;
  date: string;
}

const NotificationsAdminScreen = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = () => {
    fetch(NOTIFICATIONS_URL)
      .then(res => res.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendNotification = () => {
    if (!title || !body) {
      Alert.alert('خطأ', 'يرجى إدخال العنوان والنص');
      return;
    }
    fetch(NOTIFICATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    })
      .then(res => res.json())
      .then(data => {
        setTitle('');
        setBody('');
        fetchNotifications();
        Alert.alert('تم', 'تم إرسال الإشعار بنجاح');
      })
      .catch(() => Alert.alert('خطأ', 'فشل إرسال الإشعار'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>إدارة الإشعارات</Text>
      <TextInput
        style={styles.input}
        placeholder="عنوان الإشعار"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="نص الإشعار"
        value={body}
        onChangeText={setBody}
      />
      <Button title="إرسال إشعار" onPress={sendNotification} />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 },
  notification: { marginBottom: 16, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#E31E24' },
  body: { fontSize: 16, marginTop: 4 },
  date: { fontSize: 12, color: '#888', marginTop: 6, textAlign: 'left' }
});

export default NotificationsAdminScreen; 