import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ocrService from './src/services/ocrService';

const { width, height } = Dimensions.get('window');

interface InventoryItem {
  id: string;
  productCode: string;
  quantity: number;
  unit: '카톤' | '중포';
  expiryDate: string;
  timestamp: string;
}

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'카톤' | '중포'>('카톤');
  const [expiryDate, setExpiryDate] = useState('');
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      loadInventoryList();
    })();
  }, []);

  const loadInventoryList = async () => {
    try {
      const savedList = await AsyncStorage.getItem('inventoryList');
      if (savedList) {
        setInventoryList(JSON.parse(savedList));
      }
    } catch (error) {
      console.error('목록 로드 실패:', error);
    }
  };

  const saveInventoryList = async (list: InventoryItem[]) => {
    try {
      await AsyncStorage.setItem('inventoryList', JSON.stringify(list));
    } catch (error) {
      console.error('목록 저장 실패:', error);
    }
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  const selectArea = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const areaSize = 100;
    setSelectedArea({
      x: Math.max(0, locationX - areaSize / 2),
      y: Math.max(0, locationY - areaSize / 2),
      width: areaSize,
      height: areaSize,
    });
  };

  const processOCR = async () => {
    if (!capturedImage || !selectedArea) return;

    setIsProcessing(true);
    try {
      const extractedText = await ocrService.extractTextFromRegion(capturedImage, selectedArea);
      const numbers = extractedText.match(/\d+/g);
      
      if (numbers && numbers.length > 0) {
        setProductCode(numbers[0]);
      } else {
        setProductCode(extractedText);
      }
    } catch (error) {
      Alert.alert('OCR 오류', '텍스트 인식에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addToInventory = () => {
    if (!productCode || !quantity) {
      Alert.alert('입력 오류', '품번과 수량을 입력해주세요.');
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      productCode,
      quantity: parseInt(quantity),
      unit,
      expiryDate,
      timestamp: new Date().toLocaleString(),
    };

    const updatedList = [...inventoryList, newItem];
    setInventoryList(updatedList);
    saveInventoryList(updatedList);

    // 입력 필드 초기화
    setProductCode('');
    setQuantity('');
    setExpiryDate('');
    setCapturedImage(null);
    setSelectedArea(null);
  };

  const shareInventoryList = async () => {
    if (inventoryList.length === 0) {
      Alert.alert('알림', '공유할 목록이 없습니다.');
      return;
    }

    const listText = inventoryList.map(item => 
      `${item.productCode}\t${item.quantity}${item.unit}\t${item.expiryDate}\t${item.timestamp}`
    ).join('\n');

    const header = '품번\t수량\t유통기한\t입력시간\n';
    const fullText = header + listText;

    try {
      await Clipboard.setStringAsync(fullText);
      Alert.alert('성공', '목록이 클립보드에 복사되었습니다.');
    } catch (error) {
      Alert.alert('오류', '클립보드 복사에 실패했습니다.');
    }
  };

  const resetInventory = () => {
    Alert.alert(
      '초기화',
      '모든 목록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setInventoryList([]);
            saveInventoryList([]);
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>카메라 권한을 요청 중...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>카메라 접근 권한이 없습니다.</Text></View>;
  }



  return (
    <View style={styles.container}>
      <Text style={styles.title}>품번 인식 재고 관리</Text>
      
      {!capturedImage ? (
        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={takePicture}
        >
          <Text style={styles.cameraButtonText}>관출정리 시작</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          <TouchableOpacity style={styles.selectAreaButton} onPress={selectArea}>
            <Text style={styles.selectAreaButtonText}>품번 영역 선택</Text>
          </TouchableOpacity>
          {selectedArea && (
            <View style={[styles.selectedArea, selectedArea]} />
          )}
          <TouchableOpacity 
            style={styles.processButton} 
            onPress={processOCR}
            disabled={isProcessing}
          >
            <Text style={styles.processButtonText}>
              {isProcessing ? '처리 중...' : 'OCR 처리'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="품번"
          value={productCode}
          onChangeText={setProductCode}
        />
        <TextInput
          style={styles.input}
          placeholder="수량"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={[styles.unitButton, unit === '카톤' && styles.unitButtonActive]}
            onPress={() => setUnit('카톤')}
          >
            <Text style={styles.unitButtonText}>카톤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === '중포' && styles.unitButtonActive]}
            onPress={() => setUnit('중포')}
          >
            <Text style={styles.unitButtonText}>중포</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="유통기한 (YYYYMMDD)"
          value={expiryDate}
          onChangeText={setExpiryDate}
          maxLength={8}
        />
        <TouchableOpacity style={styles.addButton} onPress={addToInventory}>
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>재고 목록</Text>
          <TouchableOpacity style={styles.shareButton} onPress={shareInventoryList}>
            <Text style={styles.shareButtonText}>공유</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetInventory}>
            <Text style={styles.resetButtonText}>초기화</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.list}>
          {inventoryList.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.itemText}>
                {item.productCode} - {item.quantity}{item.unit}
              </Text>
              {item.expiryDate && (
                <Text style={styles.itemDate}>유통기한: {item.expiryDate}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  capturedImage: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectAreaButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectAreaButtonText: {
    color: 'white',
    fontSize: 14,
  },
  selectedArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
  processButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
  },
  processButtonText: {
    color: 'white',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  unitContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  unitButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unitButtonText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
