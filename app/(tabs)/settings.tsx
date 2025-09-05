import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppContext } from './AppContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { backendUrl, setBackendUrl, userId, setUserId, email } = useAppContext(); // email context එකෙන් ලබා ගනී
    const [tempBackendUrl, setTempBackendUrl] = useState<string>(backendUrl);

    const handleSaveSettings = () => {
        setBackendUrl(tempBackendUrl);
        Alert.alert('සාර්ථකයි', 'Backend URL එක යාවත්කාලීන විය.');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'ඔබට ඉවත් වීමට අවශ්‍ය බව සහතිකද?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        setUserId(null);
                        setUserId(null); // Clear both ID and email
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>⚙️ Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ගිණුම</Text>
                {/* නව ඊමේල් තොරතුරු මෙහි එකතු කර ඇත */}
                <View style={styles.settingItem}>
                    <Text style={styles.label}>ඊමේල්:</Text>
                    <Text style={styles.value}>{email !== null ? email : 'N/A'}</Text>
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.label}>පරිශීලක ID:</Text>
                    <Text style={styles.value}>{userId !== null ? userId : 'Log out'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="white" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>සර්වර් සැකසුම්</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.label}>Backend URL:</Text>
                </View>
                <TextInput
                    style={styles.input}
                    value={tempBackendUrl}
                    onChangeText={setTempBackendUrl}
                    placeholder="http://<your-ip-address>:3000"
                    autoCapitalize="none"
                    keyboardType="url"
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                    <Text style={styles.saveButtonText}>URL එක සුරකින්න</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>යෙදුම පිළිබඳ</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.label}>Version:</Text>
                    <Text style={styles.value}>1.0.0</Text>
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.label}>Developer:</Text>
                    <Text style={styles.value}>Sewmini Pramodya</Text>
                </View>
                <TouchableOpacity style={styles.helpButton} onPress={() => router.push('/help')}>
                    <Ionicons name="help-circle-outline" size={24} color="#4e73df" />
                    <Text style={styles.helpButtonText}>උදව් සහ සහාය</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, 
        backgroundColor: '#f0f4ff',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#444',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    saveButton: {
        backgroundColor: '#4e73df',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f0f4ff',
    },
    helpButtonText: {
        fontSize: 16,
        color: '#4e73df',
        fontWeight: 'bold',
        marginLeft: 10,
    }
});