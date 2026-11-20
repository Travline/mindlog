import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

type Preview = { board_id:number; title:string; status:'available'|'pending'|'member' };
type Props = { close:()=>void; preview:(code:string)=>Promise<Preview>; submit:(code:string)=>Promise<void> };
const prefix='mindlog:join:';
export default function JoinScanner({close,preview,submit}:Props) {
  const [permission,requestPermission,getPermission]=useCameraPermissions();
  const [scanned,setScanned]=useState<{code:string; board:Preview}|null>(null);
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const busyRef=useRef(false); const alive=useRef(true);
  useEffect(()=>{alive.current=true;void getPermission();const subscription=AppState.addEventListener('change',state=>{if(state==='active')void getPermission();});return ()=>{alive.current=false;subscription.remove();};},[getPermission]);
  const scan=async (value:string)=>{
    if(busyRef.current || scanned || error) return;
    busyRef.current=true;setBusy(true);
    try {
      if(!value.startsWith(prefix) || !/^[a-f0-9]{64}$/.test(value.slice(prefix.length))) throw new Error('Este código no es un QR de invitación de Mindlog.');
      const code=value.slice(prefix.length); const board=await preview(code);
      if(alive.current)setScanned({code,board});
    } catch(e) {if(alive.current)setError(e instanceof Error?e.message:'No se pudo leer el código.');}
    finally {busyRef.current=false;if(alive.current)setBusy(false);}
  };
  const send=async()=>{if(!scanned || busyRef.current)return;busyRef.current=true;setBusy(true);try{await submit(scanned.code);if(alive.current){setScanned(null);setError('Solicitud enviada. El dueño debe aprobarla.');}}catch(e){if(alive.current)setError(e instanceof Error?e.message:'No se pudo enviar la solicitud.');}finally{busyRef.current=false;if(alive.current)setBusy(false);}};
  const button=(label:string,fn:()=>void)=> <Pressable accessibilityRole="button" disabled={busy} accessibilityState={{disabled:busy}} onPress={fn} style={{borderWidth:1,borderColor:'#000',borderRadius:8,padding:14,alignItems:'center',opacity:busy?0.5:1}}><Text style={{color:'#000',fontWeight:'600'}}>{label}</Text></Pressable>;
  return <Modal visible animationType="slide" onRequestClose={close}><SafeAreaView style={{flex:1,backgroundColor:'#fff',padding:20,gap:16}}><Text style={{fontSize:24,fontWeight:'700',color:'#000'}}>Escanear invitación</Text>
    {!permission ? <ActivityIndicator color="#000"/> : !permission.granted ? <><Text style={{color:'#000'}}>Permite el acceso a la cámara para escanear el QR del tablero.</Text>{permission.canAskAgain?button('Permitir cámara',()=>{void requestPermission();}):button('Abrir ajustes',()=>{void Linking.openSettings();})}</> : !scanned && !error ? <><Text style={{color:'#000'}}>Apunta al código QR que muestra el dueño del tablero.</Text><CameraView style={{flex:1,minHeight:240}} facing="back" barcodeScannerSettings={{barcodeTypes:['qr']}} onBarcodeScanned={({data})=>{void scan(data);}}/>{busy&&<ActivityIndicator color="#000"/>}</> : null}
    {scanned && !error && <><Text style={{fontSize:18,color:'#000',fontWeight:'600'}}>{scanned.board.title}</Text><Text style={{color:'#000'}}>{scanned.board.status==='pending'?'Ya tienes una solicitud pendiente.':scanned.board.status==='member'?'Ya perteneces a este tablero.':'¿Quieres solicitar unirte a este tablero?'}</Text>{scanned.board.status==='available'&&button(busy?'Enviando…':'Enviar solicitud',()=>{void send();})}{button('Escanear otro código',()=>setScanned(null))}</>}
    {!!error&&<><Text accessibilityRole="alert" style={{color:'#000'}}>{error}</Text>{button('Escanear otro código',()=>{setError('');setScanned(null);})}</>}
    {button('Cerrar',close)}
  </SafeAreaView></Modal>;
}
