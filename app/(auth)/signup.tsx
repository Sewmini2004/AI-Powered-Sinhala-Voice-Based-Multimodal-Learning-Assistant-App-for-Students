import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignup = async () => {
        console.log("1. Starting signup process..."); 

        if (!email.trim() || !password.trim()) {
            console.log("❌ 1a. Validation failed: Missing email or password.");
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        try {
            console.log("2. Sending signup request to backend...");
            const response = await axios.post('http://192.168.181.183:3000/signup', {
                email: email,
                password: password,
            });

            console.log("✅ 3. Request successful. Response status:", response.status); 
            if (response.status === 201) {
                Alert.alert('Success', 'Account created successfully!');
                router.replace('/login');
            }
        } catch (error: any) {
            console.log("❌ 4. An error occurred. Entering catch block."); 
            console.error('Full Error Object:', error); 

            if (error.response) {
                console.log("⚠️ 4a. Backend responded with a status code.");
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);

                if (error.response.status === 409) {
                    Alert.alert('Error', 'This email is already registered.');
                } else {
                    Alert.alert('Error', 'Something went wrong. Please try again.');
                }
            } else if (error.request) {
                console.log("⚠️ 4b. No response received from the backend.");
                Alert.alert('Error', 'Network Error. Please check if the backend is running and the URL is correct.');
            } else {
                console.log("⚠️ 4c. Request setup error:", error.message);
                Alert.alert('Error', 'Something went wrong with the request setup. Please try again.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
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
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f0f4ff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', padding: 15, marginBottom: 20, borderRadius: 10, fontSize: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    button: { backgroundColor: '#4e73df', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 5 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});