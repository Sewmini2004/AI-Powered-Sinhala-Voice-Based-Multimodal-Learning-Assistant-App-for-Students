import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        try {
            const response = await axios.post('http://192.168.43.114:3000/login', {
                email: email,
                password: password,
            });

            if (response.status === 200) {
                // Alert.alert('Success', 'Login successful!');
                router.replace('/');
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                Alert.alert('Error', 'Invalid email or password.');
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Login failed.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text
                style={styles.link}
                onPress={() => router.push('/signup')}>
                Don't have an account? Sign up
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f0f4ff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', padding: 15, marginBottom: 20, borderRadius: 10, fontSize: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    button: { backgroundColor: '#4e73df', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 5 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { marginTop: 20, color: '#4e73df', textAlign: 'center', fontSize: 16 }
});