import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import createProfileStyles from '../styles/ProfileStyles';
import createAuthStyles from '../styles/AuthStyles';

export default function EditProfileScreen({ isDark, user, onUpdateUser, onCancel }) {
  const profileStyles = createProfileStyles(isDark);
  const authStyles = createAuthStyles(isDark);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    weight: String(user?.weight || ''),
    height: String(user?.height || ''),
    birthDate: user?.birthDate || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const { firstName, lastName, weight, height, birthDate } = formData;

    if (!firstName || !lastName || !weight || !height || !birthDate) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    onUpdateUser({
      ...user,
      firstName,
      lastName,
      weight: Number(weight),
      height: Number(height),
      birthDate,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={onCancel} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
          </TouchableOpacity>
          <Text style={profileStyles.title}>แก้ไขโปรไฟล์</Text>
        </View>

        <View style={authStyles.form}>
          <View style={authStyles.row}>
            <View style={[authStyles.inputContainer, { flex: 1 }]}>
              <Text style={authStyles.label}>ชื่อจริง</Text>
              <TextInput
                style={authStyles.input}
                value={formData.firstName}
                onChangeText={(v) => handleInputChange('firstName', v)}
              />
            </View>
            <View style={[authStyles.inputContainer, { flex: 1 }]}>
              <Text style={authStyles.label}>นามสกุล</Text>
              <TextInput
                style={authStyles.input}
                value={formData.lastName}
                onChangeText={(v) => handleInputChange('lastName', v)}
              />
            </View>
          </View>

          <View style={authStyles.row}>
            <View style={[authStyles.inputContainer, { flex: 1 }]}>
              <Text style={authStyles.label}>น้ำหนัก (kg)</Text>
              <TextInput
                style={authStyles.input}
                value={formData.weight}
                onChangeText={(v) => handleInputChange('weight', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[authStyles.inputContainer, { flex: 1 }]}>
              <Text style={authStyles.label}>ส่วนสูง (cm)</Text>
              <TextInput
                style={authStyles.input}
                value={formData.height}
                onChangeText={(v) => handleInputChange('height', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>วันเดือนปีเกิด (YYYY-MM-DD)</Text>
            <TextInput
              style={authStyles.input}
              value={formData.birthDate}
              onChangeText={(v) => handleInputChange('birthDate', v)}
            />
          </View>

          <TouchableOpacity style={authStyles.button} onPress={handleSave}>
            <Text style={authStyles.buttonText}>บันทึกข้อมูล</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[authStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ef4444', marginTop: 12 }]}
            onPress={onCancel}
          >
            <Text style={[authStyles.buttonText, { color: '#ef4444' }]}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
