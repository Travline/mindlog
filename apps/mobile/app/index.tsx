import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Svg, Path } from 'react-native-svg';
import * as SecureStore from 'expo-secure-store';
import { Accelerometer } from 'expo-sensors';
import { createButton } from '@gluestack-ui/core/button/creator';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
import { api, ApiError, type Board, type BoardDetail, type Card, type Column, type Member, type Notification, type JoinRequest, type User } from '../lib/api';
import Logo from '../assets/icons/Logo';
import QRCode from 'react-native-qrcode-svg';
import JoinScanner from '../components/JoinScanner';
import { supportsPush, syncPush, unregisterPush, type PermissionState } from '../lib/notifications';
import { PRIORITIES, SORT_OPTIONS, selectTickets, type Priority, type TicketSort } from '../lib/ticket-list';

type Field = { key: string; label: string; value?: string; secret?: boolean; multiline?: boolean; keyboard?: 'email-address'; options?: readonly string[]; kind?: 'date' };
type Form = { title: string; fields: Field[]; submit: (values: Record<string, string>) => Promise<void> };
const GluestackButton = createButton({ Root: Pressable, Text, Group: View, Spinner: ActivityIndicator, Icon: UIIcon });
const TOKEN_KEY = 'mindlog-session';
const PRIORITY_COLORS: Record<string, { background: string; text: string }> = {
  Baja: { background: '#dcfce7', text: '#166534' },
  Media: { background: '#fef3c7', text: '#92400e' },
  Alta: { background: '#fee2e2', text: '#991b1b' },
};
const priorityColors = (value: string) => PRIORITY_COLORS[value] ?? { background: '#f5f5f5', text: '#404040' };
const inputStyles = StyleSheet.create({
  input: { minHeight: 48, borderWidth: 1, borderColor: '#a3a3a3', borderRadius: 8, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 10, color: '#000000', fontSize: 16 },
  searchInput: { flex: 1, borderWidth: 0 },
});

function Button({ title, onPress, outline = false, loading = false, disabled = false }: { title: string; onPress: () => void; outline?: boolean; loading?: boolean; disabled?: boolean }) {
  return <GluestackButton onPress={onPress} isDisabled={disabled || loading} accessibilityState={{ disabled: disabled || loading, busy: loading }} className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${outline ? 'border border-black bg-white' : 'bg-black'} ${disabled || loading ? 'opacity-60' : ''}`}>
    {loading && <ActivityIndicator size="small" color={outline ? '#000000' : '#ffffff'} />}
    <GluestackButton.Text className={`text-center font-semibold ${outline ? 'text-black' : 'text-white'}`}>{title}</GluestackButton.Text>
  </GluestackButton>;
}
function FieldInput({ label, value, onChange, secret, multiline, keyboard, editable = true }: { label: string; value: string; onChange: (s: string) => void; secret?: boolean; multiline?: boolean; keyboard?: 'email-address'; editable?: boolean }) {
  return <View className="gap-1"><Text className="font-semibold text-black">{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} secureTextEntry={secret} multiline={multiline} keyboardType={keyboard} editable={editable} autoCapitalize={keyboard || secret ? 'none' : 'sentences'} style={[inputStyles.input, multiline && { textAlignVertical: 'top' }]} /></View>;
}

function DateField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  // Construir y serializar en hora local evita que cambie el día por la zona horaria.
  const date = parts ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]), 12) : new Date();
  const displayValue = parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : 'Seleccionar fecha';
  return <View className="gap-1"><Text className="font-semibold text-black">{label}</Text>
    <View style={[inputStyles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${displayValue}`} accessibilityState={{ disabled }} disabled={disabled} onPress={()=>setOpen(true)} style={{ flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M4 7h16v13H4zM8 4v6m8-6v6M4 11h16" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>
        <Text style={{ color: parts ? '#000000' : '#737373', fontSize: 16 }}>{displayValue}</Text>
      </Pressable>
      {!!value&&<Pressable accessibilityRole="button" accessibilityLabel="Quitar fecha" accessibilityState={{disabled}} disabled={disabled} onPress={()=>{setOpen(false);onChange('');}} hitSlop={8} style={{ padding: 8 }}><Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M6 6l12 12M18 6 6 18" stroke="#737373" strokeWidth={2} strokeLinecap="round" /></Svg></Pressable>}
    </View>
    {open&&<><DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onValueChange={(_event, selected) => { if (disabled) return; const year=selected.getFullYear(); const month=String(selected.getMonth()+1).padStart(2,'0'); const day=String(selected.getDate()).padStart(2,'0'); onChange(`${year}-${month}-${day}`); if (Platform.OS === 'android') setOpen(false); }} onDismiss={()=>setOpen(false)} />{Platform.OS==='ios'&&<Button title="Listo" outline disabled={disabled} onPress={()=>setOpen(false)} />}</>}
  </View>;
}
function FormModal({ form, close }: { form: Form | null; close: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({}); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const savingRef = useRef(false);
  useEffect(() => { setValues(Object.fromEntries((form?.fields ?? []).map(f => [f.key, f.value ?? '']))); setError(''); }, [form]);
  return <Modal visible={!!form} animationType="slide" onRequestClose={() => { if (!savingRef.current) close(); }}><SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 16 }}>
    <Text className="text-2xl font-bold text-black">{form?.title}</Text>
    {form?.fields.map(f => f.kind === 'date' ? <DateField key={f.key} label={f.label} value={values[f.key] ?? ''} disabled={saving} onChange={v => setValues(current => ({ ...current, [f.key]: v }))} /> : f.options ? <View key={f.key} className="gap-2"><Text className="font-semibold text-black">{f.label}</Text><View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">{f.options.map(option => {
      const colors = priorityColors(option); const checked = values[f.key] === option;
      return <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked, disabled: saving }} disabled={saving} onPress={() => setValues(current => ({ ...current, [f.key]: option }))} style={{ backgroundColor: colors.background, borderColor: checked ? colors.text : 'transparent', borderWidth: 2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ color: colors.text, fontWeight: '600' }}>{checked ? '✓ ' : ''}{option}</Text></Pressable>;
    })}</View></View> : <FieldInput key={f.key} label={f.label} secret={f.secret} multiline={f.multiline} keyboard={f.keyboard} editable={!saving} value={values[f.key] ?? ''} onChange={v => setValues(x => ({ ...x, [f.key]: v }))} />)}
    {!!error && <Text accessibilityRole="alert" className="text-black">{error}</Text>}
    <Button title={saving ? 'Guardando…' : 'Guardar'} loading={saving} onPress={() => { if (!savingRef.current && form) { savingRef.current = true; setSaving(true); setError(''); form.submit(values).then(close).catch(e => setError(e instanceof Error ? e.message : 'Ocurrió un error')).finally(() => { savingRef.current = false; setSaving(false); }); } }} />
    <Button title="Cancelar" outline disabled={saving} onPress={close} />
  </ScrollView></SafeAreaView></Modal>;
}

function CenteredModal({ visible, close, children }: { visible: boolean; close: () => void; children: ReactNode }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar ventana" onPress={close} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 480, maxHeight: '80%', backgroundColor: '#ffffff', borderRadius: 12, padding: 20, gap: 16 }}>{children}</View>
    </View>
  </Modal>;
}

function AssignMembersModal({ card, board, close, save }: { card: Card; board: BoardDetail; close: () => void; save: (cardId: number, userIds: string[]) => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>(() => board.assignments.filter(assignment => assignment.card_id === card.card_id).map(assignment => assignment.user_id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savingRef = useRef(false);

  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const matchingMembers = board.members.filter(member => normalize(member.username).includes(normalize(query)));
  const closeIfIdle = () => { if (!savingRef.current) close(); };

  return <CenteredModal visible close={closeIfIdle}>
    <Text className="text-xl font-bold text-black">Asignar responsables</Text>
    <View className="flex-row items-center rounded-lg border border-neutral-400 bg-white">
      <TextInput accessibilityLabel="Buscar por nombre" placeholder="Buscar por nombre" placeholderTextColor="#737373" value={query} onChangeText={setQuery} editable={!saving} style={[inputStyles.input, inputStyles.searchInput]} />
      {query.length>0&&<Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" accessibilityState={{disabled:saving}} disabled={saving} onPress={()=>setQuery('')} hitSlop={8} style={{ paddingHorizontal: 14, paddingVertical: 10 }}><Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M6 6l12 12M18 6 6 18" stroke="#737373" strokeWidth={2} strokeLinecap="round" /></Svg></Pressable>}
    </View>
    <Text className="text-black">Seleccionados: {selected.length}</Text>
    <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }}>
      {matchingMembers.length===0 && <Text className="py-3 text-black">No se encontraron integrantes.</Text>}
      {matchingMembers.map(member => <Pressable key={member.user_id} accessibilityRole="checkbox" accessibilityState={{checked:selected.includes(member.user_id),disabled:saving}} disabled={saving} className={`flex-row items-center gap-3 rounded-lg px-3 py-3 ${selected.includes(member.user_id) ? 'bg-neutral-100' : 'bg-white'}`} onPress={() => setSelected(current => current.includes(member.user_id) ? current.filter(id => id !== member.user_id) : [...current, member.user_id])}>
        <Text className="flex-1 text-black">{member.username}</Text>{selected.includes(member.user_id)&&<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="m5 12 4 4L19 6" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
      </Pressable>)}
    </ScrollView>
    {!!error && <Text accessibilityRole="alert" className="text-black">{error}</Text>}
    <Button title={saving ? 'Guardando…' : 'Guardar'} loading={saving} onPress={() => {
      if (savingRef.current) return;
      savingRef.current = true; setSaving(true); setError('');
      save(card.card_id, selected).then(close).catch(e => setError(e instanceof Error ? e.message : 'Ocurrió un error')).finally(() => { savingRef.current = false; setSaving(false); });
    }} />
    <Button title="Cancelar" outline disabled={saving} onPress={closeIfIdle} />
  </CenteredModal>;
}

function AssignedMembersModal({ members, close }: { members: Member[] | null; close: () => void }) {
  return <CenteredModal visible={members !== null} close={close}>
    <Text className="text-xl font-bold text-black">Responsables ({members?.length ?? 0})</Text>
    <ScrollView style={{ maxHeight: 300 }}>{members?.map(member => <Text key={member.user_id} className="py-2 text-black">{member.username}</Text>)}</ScrollView>
    <Button title="Cerrar" outline onPress={close} />
  </CenteredModal>;
}

export default function Home() {
  const [token, setToken] = useState(''); const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); const [screen, setScreen] = useState<'boards'|'board'|'profile'|'settings'|'members'|'notifications'>('boards');
  const [boards, setBoards] = useState<Board[]>([]); const [board, setBoard] = useState<BoardDetail | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([...PRIORITIES]);
  const [ticketSort, setTicketSort] = useState<TicketSort>('Recientes');
  const [shakeNotice, setShakeNotice] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [requestsError, setRequestsError] = useState('');
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [openCardActionsId, setOpenCardActionsId] = useState<number | null>(null);
  const [openColumnActionsId, setOpenColumnActionsId] = useState<number | null>(null);
  const [assigningCard, setAssigningCard] = useState<Card | null>(null);
  const [viewingCardId, setViewingCardId] = useState<number | null>(null);
  const [form, setForm] = useState<Form | null>(null); const [movingCard, setMovingCard] = useState<Card | null>(null); const [register, setRegister] = useState(false);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [username, setUsername] = useState('');
  const [authBusy, setAuthBusy] = useState(false); const [restoringToken, setRestoringToken] = useState('');
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushPermission, setPushPermission] = useState<PermissionState>('unavailable');
  const [pendingNotification, setPendingNotification] = useState<{notificationId:number;boardId:number} | null>(null);
  const pushWork = useRef<Promise<unknown>>(Promise.resolve());
  const activeSession = useRef('');
  const pendingRef = useRef(false);
  const authBusyRef = useRef(false);
  const signOut = useCallback(async () => { const previous=activeSession.current; activeSession.current=''; await pushWork.current.catch(()=>{}); if(previous) await unregisterPush(previous).catch(()=>{}); await SecureStore.deleteItemAsync(TOKEN_KEY); setToken(''); setUser(null); setBoard(null); setBoards([]); setForm(null); setMovingCard(null); setOpenCardActionsId(null); setOpenColumnActionsId(null); setAssigningCard(null); setViewingCardId(null); setScreen('boards'); setRestoringToken(''); setMessage(''); setNotifications([]); setPushPermission('unavailable'); setScannerOpen(false); setInviteCode(null); setJoinRequests([]); }, []);
  const restore = useCallback(async (saved: string) => {
    setLoading(true); setMessage('');
    try { const current = await api<User>('/auth/me', saved); setToken(saved); setUser(current); setRestoringToken(''); }
    catch (e) { if (e instanceof ApiError && e.status === 401) await signOut(); else { setRestoringToken(saved); setMessage(e instanceof Error ? e.message : 'No se pudo recuperar la sesión'); } }
    finally { setLoading(false); }
  }, [signOut]);
  useEffect(() => { SecureStore.getItemAsync(TOKEN_KEY).then(saved => saved ? restore(saved) : setLoading(false)).catch(() => { setMessage('No se pudo recuperar la sesión'); setLoading(false); }); }, [restore]);
  const request = useCallback(async <T,>(path: string, method = 'GET', body?: unknown) => {
    try { return await api<T>(path, token, method, body); }
    catch (e) { if (e instanceof ApiError && e.status === 401) { await signOut(); setMessage('Tu sesión terminó. Inicia sesión nuevamente.'); } throw e; }
  }, [token, signOut]);
  const loadBoards = useCallback(async () => { const data = await request<Board[]>('/boards'); setBoards(data); }, [request]);
  const loadBoard = useCallback(async (id: number, resetSelection = false) => {
    const data = await request<BoardDetail>(`/boards/${id}`);
    if (resetSelection) { setPriorities([...PRIORITIES]); setTicketSort('Recientes'); setShakeNotice(false); }
    setSelectedColumnId(current => !resetSelection && data.columns.some(column => column.column_id === current) ? current : data.columns[0]?.column_id ?? null);
    setBoard(data);
    return data;
  }, [request]);
  const loadNotifications = useCallback(async () => { const items=await request<Notification[]>('/notifications'); setNotifications(items); return items; }, [request]);
  const loadJoinRequests = useCallback(async (boardId:number) => { setRequestsLoading(true); try { const items=await request<JoinRequest[]>(`/invitations/boards/${boardId}/requests`); setJoinRequests(items); setRequestsError(''); } finally { setRequestsLoading(false); } }, [request]);
  useEffect(()=>{ if(screen!=='settings' || !board?.is_owner) return; setJoinRequests([]); setRequestsError(''); void loadJoinRequests(board.board_id).catch(e=>setRequestsError(e instanceof Error?e.message:'No se pudieron cargar las solicitudes.')); },[screen,board?.board_id,board?.is_owner,loadJoinRequests]);
  useEffect(() => {
    if (!token) return;
    activeSession.current=token;
    const sync = (ask: boolean, devicePushToken?: import('expo-notifications').DevicePushToken) => {
      pushWork.current=pushWork.current.catch(()=>{}).then(async()=>{
        if(activeSession.current!==token) return;
        try { const state=await syncPush(token,ask,devicePushToken); if(activeSession.current===token) setPushPermission(state); }
        catch { if(activeSession.current===token) setPushPermission('error'); }
      });
    };
    let disposed=false;
    let tokenSubscription: {remove:()=>void} | undefined;
    if(supportsPush) void import('expo-notifications').then(Notifications=>{
      if(!disposed) tokenSubscription=Notifications.addPushTokenListener(devicePushToken=>sync(false,devicePushToken));
    }).catch(()=>{});
    sync(true);
    const subscription=AppState.addEventListener('change',state=>{ if(state==='active') { sync(false); void loadNotifications().catch(()=>{}); } });
    void loadNotifications().catch(()=>{});
    return () => { disposed=true; tokenSubscription?.remove(); subscription.remove(); if(activeSession.current===token) activeSession.current=''; };
  }, [token,loadNotifications]);
  useEffect(() => {
    if (!supportsPush) return;
    let disposed=false;
    let responseSubscription: {remove:()=>void} | undefined;
    let receivedSubscription: {remove:()=>void} | undefined;
    void import('expo-notifications').then(async Notifications=>{
      if(disposed) return;
      Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
      const handle=(response: import('expo-notifications').NotificationResponse) => {
        const data=response.notification.request.content.data;
        const notificationId=Number(data?.notificationId), boardId=Number(data?.boardId);
        if(Number.isSafeInteger(notificationId) && notificationId>0 && Number.isSafeInteger(boardId) && boardId>0) setPendingNotification({notificationId,boardId});
        void Notifications.clearLastNotificationResponseAsync();
      };
      responseSubscription=Notifications.addNotificationResponseReceivedListener(handle);
      receivedSubscription=Notifications.addNotificationReceivedListener(()=>{if(activeSession.current) void loadNotifications().catch(()=>{});});
      const last=await Notifications.getLastNotificationResponseAsync(); if(last && !disposed) handle(last);
    }).catch(()=>{});
    return ()=>{disposed=true;responseSubscription?.remove();receivedSubscription?.remove();};
  }, [loadNotifications]);
  const openNotification=useCallback(async (notificationId:number,boardId:number)=>{
    try {
      const items=await request<Notification[]>('/notifications');
      const item=items.find(note=>note.notification_id===notificationId);
      if(!item) throw new ApiError('Notificación no encontrada',404);
      await request(`/notifications/${notificationId}/read`,'PUT');
      await loadNotifications();
      if(item.kind==='join_rejected') {setBoard(null);setScreen('boards');await loadBoards();Alert.alert('Mindlog',item.message);return;}
      const target=await loadBoard(item.board_id,true);
      if(item.kind==='join_requested' && target.is_owner) {await loadJoinRequests(item.board_id);setScreen('settings');return;}
      setScreen('board');
    } catch(e) {
      if(e instanceof ApiError && (e.status===403 || e.status===404)) { setBoard(null);setScreen('boards');Alert.alert('Mindlog','Esta notificación o el tablero ya no están disponibles.'); }
      else Alert.alert('Mindlog',e instanceof Error ? e.message : 'No se pudo abrir la notificación');
    }
  },[request,loadNotifications,loadBoard,loadBoards,loadJoinRequests]);
  useEffect(()=>{if(user && token && pendingNotification){const item=pendingNotification;setPendingNotification(null);void openNotification(item.notificationId,item.boardId);}},[user,token,pendingNotification,openNotification]);
  const run = useCallback((fn: () => Promise<unknown>, message = 'Actualizando…') => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPendingMessage(message);
    Promise.resolve().then(fn)
      .catch(e => Alert.alert('Mindlog', e instanceof Error ? e.message : 'Ocurrió un error'))
      .finally(() => { pendingRef.current = false; setPendingMessage(null); });
  }, []);
  useEffect(() => { if (token) run(loadBoards, 'Cargando tableros…'); }, [token, loadBoards, run]);
  useEffect(() => {
    const subscription=AppState.addEventListener('change', state=>setAppActive(state==='active'));
    return ()=>subscription.remove();
  }, []);
  useEffect(() => {
    if (screen !== 'board' || !board || selectedColumnId === null || !appActive || form || movingCard || assigningCard || viewingCardId !== null || openCardActionsId !== null || openColumnActionsId !== null || columnSelectorOpen || filtersOpen || confirmOpen || pendingMessage) return;
    let disposed=false;
    let subscription: {remove:()=>void} | undefined;
    let previousPeak=0, lastShake=0, aboveThreshold=false;
    void Accelerometer.isAvailableAsync().then(available=>{
      if (!available || disposed) return;
      Accelerometer.setUpdateInterval(100);
      subscription=Accelerometer.addListener(({x,y,z})=>{
        const now=Date.now();
        const high=Math.sqrt(x*x+y*y+z*z)>=2.2;
        if (high && !aboveThreshold) {
          if (previousPeak && now-previousPeak<=800 && now-lastShake>=2000) {
            lastShake=now; previousPeak=0; setTicketSort('Fecha y prioridad'); setShakeNotice(true);
          } else previousPeak=now;
        }
        aboveThreshold=high;
      });
    }).catch(()=>{});
    return ()=>{ disposed=true;subscription?.remove(); };
  }, [screen,board?.board_id,selectedColumnId,appActive,form,movingCard,assigningCard,viewingCardId,openCardActionsId,openColumnActionsId,columnSelectorOpen,filtersOpen,confirmOpen,pendingMessage]);
  useEffect(()=>{if (!shakeNotice) return; const timeout=setTimeout(()=>setShakeNotice(false),3000);return ()=>clearTimeout(timeout);},[shakeNotice]);
  useEffect(()=>{if(screen==='boards'){setPriorities([...PRIORITIES]);setTicketSort('Recientes');setShakeNotice(false);setFiltersOpen(false);}},[screen]);
  const goBack = useCallback(() => {
    setOpenCardActionsId(null);
    setOpenColumnActionsId(null);
    if (screen === 'settings' || screen === 'members') {
      setScreen('board');
    } else if (screen !== 'boards') {
      setColumnSelectorOpen(false);
      setScreen('boards');
      run(loadBoards, 'Cargando tableros…');
    }
  }, [screen, run, loadBoards]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pendingRef.current) return true;
      if (openCardActionsId !== null) { setOpenCardActionsId(null); return true; }
      if (openColumnActionsId !== null) { setOpenColumnActionsId(null); return true; }
      if (columnSelectorOpen) { setColumnSelectorOpen(false); return true; }
      if (filtersOpen) { setFiltersOpen(false); return true; }
      if (!user || screen === 'boards') return false;
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [user, screen, goBack, openCardActionsId, openColumnActionsId, columnSelectorOpen, filtersOpen]);
  const login = async () => {
    if (authBusyRef.current) return; authBusyRef.current = true; setAuthBusy(true); setMessage('');
    try { const result = await api<{token: string; user: User}>(register ? '/auth/register' : '/auth/login', undefined, 'POST', { email, password, ...(register ? { username } : {}) }); await SecureStore.setItemAsync(TOKEN_KEY, result.token); setToken(result.token); setUser(result.user); setPassword(''); }
    catch(e) { setMessage(e instanceof Error ? e.message : 'Error al iniciar sesión'); } finally { authBusyRef.current = false; setAuthBusy(false); }
  };
  const confirm = (title: string, description: string, onConfirm: () => void, action = 'Eliminar') => { setConfirmOpen(true); Alert.alert(title, description, [{text:'Cancelar', style:'cancel', onPress:()=>setConfirmOpen(false)}, {text:action, style:'destructive', onPress:()=>{setConfirmOpen(false);onConfirm();}}], {onDismiss:()=>setConfirmOpen(false)}); };
  const openBoardForm = (item?: Board) => setForm({ title: item ? 'Editar tablero' : 'Nuevo tablero', fields: [{key:'title', label:'Título', value:item?.title}, {key:'description', label:'Descripción', value:item?.description ?? '', multiline:true}], submit: async values => { await request(item ? `/boards/${item.board_id}` : '/boards', item ? 'PUT':'POST', values); await loadBoards(); if(item) await loadBoard(item.board_id); } });
  const openColumnForm = (item?: Column) => { if(!board) return; setForm({ title: item ? 'Editar columna' : 'Nueva columna', fields:[{key:'title', label:'Título', value:item?.title}], submit:async values => { await request(`/boards/${board.board_id}/columns${item ? `/${item.column_id}` : ''}`,item?'PUT':'POST',values); await loadBoard(board.board_id); } }); };
  const openCardForm = (columnId: number, card?: Card) => { if(!board) return; setForm({ title:card?'Editar ticket':'Nuevo ticket', fields:[{key:'title',label:'Título',value:card?.title},{key:'description',label:'Descripción',value:card?.description ?? '',multiline:true},{key:'priority',label:'Prioridad',value:card?.priority ?? 'Media',options:PRIORITIES},{key:'due_date',label:'Fecha límite (opcional)',value:card?.due_date ?? '',kind:'date'}],submit:async values=>{ const path=card?`/boards/${board.board_id}/cards/${card.card_id}`:`/boards/${board.board_id}/columns/${columnId}/cards`; await request(path,card?'PUT':'POST',{...values,...(card?{column_id:card.column_id}:{})});await loadBoard(board.board_id); } }); };
  const moveCard = (card: Card) => setMovingCard(card);
  const actionCard = board?.cards.find(card => card.card_id === openCardActionsId);
  const actionColumn = board?.columns.find(column => column.column_id === openColumnActionsId);
  const visibleCards = board ? selectTickets(board.cards, selectedColumnId, priorities, ticketSort) : [];
  const unreadCount = notifications.filter(item => !item.read_at).length;
  const viewedMembers = viewingCardId !== null && board ? board.members.filter(member => board.assignments.some(assignment => assignment.card_id === viewingCardId && assignment.user_id === member.user_id)) : null;
  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', gap: 12 }} accessibilityRole="progressbar" accessibilityLabel="Preparando sesión"><ActivityIndicator color="black" /><Text className="text-black">Preparando sesión…</Text></SafeAreaView>;
  if (restoringToken) return <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', gap: 16, padding: 24 }}><Text className="text-black">{message}</Text><Button title="Reintentar" onPress={()=>{void restore(restoringToken);}}/><Button title="Cerrar sesión" outline onPress={()=>{void signOut();}}/></SafeAreaView>;
  if (!user) return <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,gap:16,flexGrow:1,justifyContent:'center'}}><View className="h-16 w-16 self-center"><Logo /></View><Text className="text-center text-3xl font-bold text-black">Mindlog</Text><Text className="text-center text-black">{register?'Crea tu cuenta':'Organiza tus ideas y tareas'}</Text>{register&&<FieldInput label="Nombre" value={username} onChange={setUsername} editable={!authBusy}/>}<FieldInput label="Correo" value={email} onChange={setEmail} keyboard="email-address" editable={!authBusy}/><FieldInput label="Contraseña" value={password} onChange={setPassword} secret editable={!authBusy}/>{!!message&&<Text accessibilityRole="alert" className="text-black">{message}</Text>}<Button title={authBusy?'Espera…':register?'Crear cuenta':'Iniciar sesión'} loading={authBusy} onPress={()=>{void login();}}/><Button title={register?'Ya tengo una cuenta':'Crear una cuenta'} outline disabled={authBusy} onPress={()=>{setRegister(!register);setMessage('');}}/></ScrollView></SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}><ScrollView importantForAccessibility={pendingMessage || openCardActionsId !== null || openColumnActionsId !== null ? 'no-hide-descendants' : 'auto'} contentContainerStyle={{padding:20,gap:16}}>
   <View className="flex-row items-center justify-between">{screen!=='boards'&&<Pressable accessibilityRole="button" accessibilityLabel="Volver" hitSlop={8} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 8 }} onPress={goBack}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M15 5 8 12l7 7" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg></Pressable>}<Text className="flex-1 text-2xl font-bold text-black">{screen==='board' ? board?.title : screen==='settings'?'Configuración del tablero':screen==='members'?'Integrantes':screen==='notifications'?'Notificaciones':screen==='profile'?'Mi perfil':'Mis tableros'}</Text>{screen==='board'&&board&&<Pressable accessibilityRole="button" accessibilityLabel="Más opciones del tablero" hitSlop={8} className="ml-3 px-2" onPress={()=>{setColumnSelectorOpen(false);setOpenCardActionsId(null);setScreen(board.is_owner?'settings':'members');}}><Text className="text-3xl font-bold text-black">⋯</Text></Pressable>}{screen==='boards'&&<View className="flex-row items-center gap-2"><Pressable accessibilityRole="button" accessibilityLabel={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'} onPress={()=>{setScreen('notifications');run(loadNotifications,'Cargando notificaciones…');}} style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>{unreadCount>0&&<View accessible={false} style={{position:'absolute',top:0,right:0,minWidth:19,height:19,paddingHorizontal:4,borderRadius:10,backgroundColor:'#000000',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#ffffff',fontSize:10,fontWeight:'700'}}>{unreadCount>99?'99+':unreadCount}</Text></View>}</Pressable><Pressable accessibilityRole="button" accessibilityLabel="Perfil" onPress={()=>setScreen('profile')} style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg></Pressable></View>}</View>
   {screen==='profile' && <><Text className="text-base text-black">{user.username}{'\n'}{user.email}</Text><Button title="Editar perfil" outline onPress={()=>setForm({title:'Editar perfil',fields:[{key:'username',label:'Nombre',value:user.username},{key:'email',label:'Correo',value:user.email,keyboard:'email-address'}],submit:async values=>{const updated=await request<User>('/auth/me','PUT',values);setUser(updated);}})}/><Button title="Cerrar sesión" onPress={()=>run(signOut)}/></>}
   {screen==='boards' && <><Button title="Escanear QR para unirme" outline onPress={()=>setScannerOpen(true)}/><Button title="Crear tablero" onPress={()=>openBoardForm()}/>{boards.length===0&&!pendingMessage&&<Text className="text-black">Aún no tienes tableros.</Text>}{boards.map(item=><Pressable key={item.board_id} className="gap-2 rounded-xl border border-neutral-300 p-4" onPress={()=>run(async()=>{await loadBoard(item.board_id,true);setColumnSelectorOpen(false);setScreen('board');},'Abriendo tablero…')}><Text className="text-lg font-bold text-black">{item.title}</Text><Text className="text-black">{item.description || 'Sin descripción'}</Text><Text className="text-neutral-600">{item.is_owner?'Propio':'Compartido'}</Text></Pressable>)}</>}
   {screen==='settings' && board && !!board.is_owner && <>
    <Text className="text-black">{board.title}</Text>
    <Text className="text-black">{board.description || 'Sin descripción'}</Text>
    <Button title="Editar tablero" outline onPress={()=>openBoardForm(board)}/>
    <Button title="Eliminar tablero" outline onPress={()=>confirm('Eliminar tablero','Se eliminarán todas sus columnas y tickets.',()=>run(async()=>{await request(`/boards/${board.board_id}`,'DELETE');setBoard(null);setScreen('boards');await loadBoards();}))}/>
    <Button title="Mostrar QR de invitación" outline onPress={()=>run(async()=>{const data=await request<{code:string}>(`/invitations/boards/${board.board_id}/code`);setInviteCode(data.code);},'Cargando código…')}/>
    <Text className="text-xl font-bold text-black">Solicitudes de unión</Text>
    {!!requestsError && <View className="gap-2"><Text accessibilityRole="alert" className="text-black">{requestsError}</Text><Button title="Reintentar" outline onPress={()=>run(()=>loadJoinRequests(board.board_id))}/></View>}
    {requestsLoading && <ActivityIndicator color="black" accessibilityLabel="Cargando solicitudes"/>}
    {!requestsLoading && !requestsError && joinRequests.length===0 && <Text className="text-black">No hay solicitudes pendientes.</Text>}
    {joinRequests.map(item=><View key={item.request_id} className="gap-2 rounded-lg border border-neutral-300 p-3"><Text className="font-semibold text-black">{item.username}</Text><Text className="text-black">{item.email}</Text><View className="flex-row gap-4"><Pressable accessibilityRole="button" onPress={()=>run(async()=>{await request(`/invitations/boards/${board.board_id}/requests/${item.request_id}`,'PUT',{decision:'accept'});await loadJoinRequests(board.board_id);await loadBoard(board.board_id);})}><Text className="font-semibold text-black underline">Aceptar</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>run(async()=>{await request(`/invitations/boards/${board.board_id}/requests/${item.request_id}`,'PUT',{decision:'reject'});await loadJoinRequests(board.board_id);})}><Text className="font-semibold text-black underline">Rechazar</Text></Pressable></View></View>)}
    <Text className="text-xl font-bold text-black">Integrantes</Text>
    {board.members.map(member=><View key={member.user_id} className="flex-row items-center justify-between gap-2"><Text className="flex-1 text-black">{member.username} · {member.email}{member.is_owner?' (dueño)':''}</Text>{!member.is_owner&&<Pressable onPress={()=>confirm('Retirar integrante',`Retirar a ${member.username} también elimina sus asignaciones.`,()=>run(async()=>{await request(`/boards/${board.board_id}/members/${member.user_id}`,'DELETE');await loadBoard(board.board_id);} ))}><Text className="text-black underline">Retirar</Text></Pressable>}</View>)}
    <Button title="Agregar integrante" outline onPress={()=>setForm({title:'Agregar integrante',fields:[{key:'email',label:'Correo de usuario registrado',keyboard:'email-address'}],submit:async values=>{await request(`/boards/${board.board_id}/members`,'POST',values);await loadBoard(board.board_id);await loadJoinRequests(board.board_id);}})}/>
   </>}
   {screen==='notifications' && <>
    {pushPermission==='active' && <Text className="text-black">Los avisos están activados en este dispositivo.</Text>}
    {pushPermission==='disabled' && <View className="gap-2 rounded-lg border border-neutral-300 p-4"><Text className="text-black">Las notificaciones están desactivadas en este dispositivo. Actívalas en los ajustes para recibir avisos.</Text><Button title="Abrir ajustes" outline onPress={()=>{void Linking.openSettings();}}/></View>}
    {pushPermission==='error' && <Text className="text-black">No se pudieron activar los avisos. Comprueba tu conexión y la configuración de la aplicación.</Text>}
    {pushPermission==='unavailable' && <Text className="text-black">Los avisos push requieren una compilación Android instalada en un dispositivo compatible.</Text>}
    {notifications.length===0 && <Text className="text-black">Aún no tienes notificaciones.</Text>}
    {notifications.map(item=><Pressable key={item.notification_id} accessibilityRole="button" accessibilityLabel={`${item.read_at?'Leída':'No leída'}: ${item.message}`} className={`gap-1 rounded-lg border border-neutral-200 p-4 ${item.read_at?'bg-white':'bg-neutral-100'}`} onPress={()=>{run(()=>openNotification(item.notification_id,item.board_id),'Abriendo tablero…');}}><Text className={`text-black ${item.read_at?'':'font-bold'}`}>{item.message}</Text><Text className="text-neutral-600">{item.created_at} {item.read_at?'':'· No leída'}</Text></Pressable>)}
   </>}
   {screen==='members' && board && !board.is_owner && <>
    <Text className="text-black">{board.description || 'Sin descripción'}</Text>
    <Text className="text-black">Integrantes de {board.title}</Text>
    {board.members.map(member=><Text key={member.user_id} className="text-black">{member.username}{member.is_owner?' (dueño)':''}</Text>)}
    <Button title="Abandonar tablero" outline onPress={()=>confirm('Abandonar tablero','Perderás el acceso a este tablero.',()=>run(async()=>{await request(`/boards/${board.board_id}/members/${user.user_id}`,'DELETE');setBoard(null);setScreen('boards');await loadBoards();}),'Abandonar')}/>
   </>}
   {screen==='board' && board && <>
    {board.columns.length===0&&<><Text className="text-black">No tienes ninguna columna existente.</Text><Button title="Crear columna" onPress={()=>openColumnForm()}/></>}
    {board.columns.length>0 && <View className="gap-3 rounded-xl border border-neutral-300 bg-white p-4">
     <Pressable accessibilityRole="button" accessibilityLabel="Filtros y orden" accessibilityState={{expanded:filtersOpen}} onPress={()=>setFiltersOpen(open=>!open)} className="flex-row items-center justify-between"><Text className="text-lg font-bold text-black">Filtros y orden</Text><Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d={filtersOpen?'m6 15 6-6 6 6':'m6 9 6 6 6-6'} stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg></Pressable>
     {filtersOpen && <View className="gap-3">
     <Text className="font-semibold text-black">Prioridad</Text>
     <View className="flex-row flex-wrap gap-2">{PRIORITIES.map(priority=>{const checked=priorities.includes(priority);return <Pressable key={priority} accessibilityRole="checkbox" accessibilityState={{checked}} onPress={()=>setPriorities(current=>checked?current.filter(item=>item!==priority):[...current,priority])} className={`rounded-lg border px-3 py-2 ${checked?'border-black bg-neutral-100':'border-neutral-300 bg-white'}`}><Text className="text-black">{priority}</Text></Pressable>;})}</View>
     <Text className="font-semibold text-black">Ordenar por</Text>
     <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">{SORT_OPTIONS.map(option=><Pressable key={option} accessibilityRole="radio" accessibilityState={{checked:ticketSort===option}} onPress={()=>{setTicketSort(option);setShakeNotice(false);}} className={`rounded-lg border px-3 py-2 ${ticketSort===option?'border-black bg-neutral-100':'border-neutral-300 bg-white'}`}><Text className="text-black">{option}</Text></Pressable>)}</View>
     {ticketSort==='Fecha y prioridad' && <Text className="text-neutral-600">Orden actual: fecha y prioridad (gesto).</Text>}
     <Text className="text-sm text-neutral-600">Agita el teléfono para ordenar por fecha y prioridad.</Text>
     </View>}
     {shakeNotice && <Text accessibilityRole="alert" className="font-semibold text-black">Orden aplicado: fecha y prioridad.</Text>}
    </View>}
    {board.columns.filter(column=>column.column_id===selectedColumnId).map(column=><View key={column.column_id} className="gap-3 rounded-xl border border-neutral-300 bg-white p-4">
     <View className="flex-row items-center gap-2"><Pressable accessibilityRole="combobox" accessibilityLabel={`Columna ${column.title}, seleccionar columna`} accessibilityState={{expanded:columnSelectorOpen}} className="flex-1 flex-row items-center gap-2" onPress={()=>setColumnSelectorOpen(open=>!open)}><Text className="flex-shrink text-lg font-bold text-black">{column.title}</Text><Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d={columnSelectorOpen?'m6 15 6-6 6 6':'m6 9 6 6 6-6'} stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Opciones de la columna ${column.title}`} accessibilityState={{expanded:openColumnActionsId===column.column_id}} hitSlop={8} className="px-2" onPress={()=>{setColumnSelectorOpen(false);setOpenCardActionsId(null);setOpenColumnActionsId(column.column_id);}}><Text className="text-2xl font-bold text-black">⋯</Text></Pressable></View>
     {columnSelectorOpen&&<View className="border-t border-neutral-200 pt-2"><ScrollView nestedScrollEnabled style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">{board.columns.map(option=><Pressable key={option.column_id} accessibilityRole="radio" accessibilityState={{checked:option.column_id===selectedColumnId}} className={`flex-row items-center gap-3 rounded-lg px-3 py-3 ${option.column_id===selectedColumnId?'bg-neutral-100':'bg-white'}`} onPress={()=>{setSelectedColumnId(option.column_id);setColumnSelectorOpen(false);setOpenCardActionsId(null);setOpenColumnActionsId(null);}}><Text className="flex-1 text-black">{option.title}</Text>{option.column_id===selectedColumnId&&<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="m5 12 4 4L19 6" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>}</Pressable>)}<Pressable accessibilityRole="button" className="flex-row items-center gap-2 rounded-lg px-3 py-3" onPress={()=>{setColumnSelectorOpen(false);openColumnForm();}}><Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M12 5v14M5 12h14" stroke="#000000" strokeWidth={2} strokeLinecap="round" /></Svg><Text className="font-semibold text-black">Añadir nueva columna</Text></Pressable></ScrollView></View>}
     <Pressable accessibilityRole="button" accessibilityLabel="Crear ticket" onPress={()=>openCardForm(column.column_id)} style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 8, backgroundColor: '#000000', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}><Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M12 5v14M5 12h14" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" /></Svg><Text style={{ color: '#ffffff', fontWeight: '600' }}>Crear ticket</Text></Pressable>
     {!board.cards.some(card=>card.column_id===column.column_id)&&<Text className="text-black">Esta columna aún no tiene tickets.</Text>}
     {board.cards.some(card=>card.column_id===column.column_id) && visibleCards.length===0 && <View className="gap-2"><Text className="text-black">No hay tickets para las prioridades seleccionadas.</Text><Button title="Restablecer prioridades" outline onPress={()=>setPriorities([...PRIORITIES])}/></View>}
     {visibleCards.map(card=>{
      const count = board.assignments.filter(assignment=>assignment.card_id===card.card_id).length;
      return <View key={card.card_id} className="gap-2 rounded-lg border border-neutral-300 bg-white p-3">
       <View className="flex-row items-center justify-between"><Text className="flex-1 font-bold text-black">{card.title}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Opciones de ${card.title}`} accessibilityState={{expanded:openCardActionsId===card.card_id}} hitSlop={8} className="px-2" onPress={()=>setOpenCardActionsId(card.card_id)}><Text className="text-2xl font-bold text-black">⋯</Text></Pressable></View>
       <View className="flex-row flex-wrap gap-2"><View accessible accessibilityLabel={`Prioridad ${card.priority}`} style={{ backgroundColor: priorityColors(card.priority).background, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ color: priorityColors(card.priority).text, fontSize: 12, fontWeight: '600' }}>{card.priority}</Text></View>{card.due_date&&<View accessible accessibilityLabel={`Fecha de vencimiento ${card.due_date}`} style={{ backgroundColor: '#f5f5f5', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ color: '#404040', fontSize: 12, fontWeight: '600' }}>{card.due_date}</Text></View>}</View>
       {!!card.description&&<Text className="text-black">{card.description}</Text>}
       {count>0&&<Pressable accessibilityRole="link" accessibilityLabel="Ver responsables" className="flex-row items-center self-start" onPress={()=>setViewingCardId(card.card_id)}><Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="m9 5 7 7-7 7" stroke="#737373" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text className="text-neutral-500">Ver responsables</Text></Pressable>}
      </View>;
     })}
    </View>)}
   </>}
  </ScrollView>
  {actionColumn && board && screen==='board' && <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Cerrar opciones" onPress={()=>setOpenColumnActionsId(null)} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
    <View accessibilityViewIsModal accessibilityRole="menu" style={{ width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 12, padding: 16 }}>
      <View className="mb-2 flex-row items-center border-b border-neutral-200 pb-3"><Text className="flex-1 px-4 py-2 text-lg font-bold text-black">{actionColumn.title}</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar opciones" hitSlop={8} onPress={()=>setOpenColumnActionsId(null)} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}><Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M6 6l12 12M18 6 6 18" stroke="#000000" strokeWidth={2} strokeLinecap="round" /></Svg></Pressable></View>
      <Pressable accessibilityRole="menuitem" className="flex-row items-center justify-center gap-2 px-4 py-4" onPress={()=>{setOpenColumnActionsId(null);openColumnForm(actionColumn);}}><Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4.8 15 4 20Z" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text className="text-black">Editar</Text></Pressable>
      <Pressable accessibilityRole="menuitem" className="flex-row items-center justify-center gap-2 px-4 py-4" onPress={()=>{setOpenColumnActionsId(null);confirm('Eliminar columna','Se eliminarán sus tickets.',()=>confirm('Confirmación final','Esta acción eliminará definitivamente la columna y sus tickets.',()=>run(async()=>{await request(`/boards/${board.board_id}/columns/${actionColumn.column_id}`,'DELETE');await loadBoard(board.board_id);})));}}><Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="#b42318" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text style={{ color: '#b42318' }}>Eliminar</Text></Pressable>
    </View>
  </View>}
  {actionCard && board && screen==='board' && <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Cerrar opciones" onPress={()=>setOpenCardActionsId(null)} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
    <View accessibilityViewIsModal accessibilityRole="menu" style={{ width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 12, padding: 16 }}>
      <View className="mb-2 flex-row items-center border-b border-neutral-200 pb-3"><Text className="flex-1 px-4 py-2 text-lg font-bold text-black">{actionCard.title}</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar opciones" hitSlop={8} onPress={()=>setOpenCardActionsId(null)} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}><Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M6 6l12 12M18 6 6 18" stroke="#000000" strokeWidth={2} strokeLinecap="round" /></Svg></Pressable></View>
      <Pressable accessibilityRole="menuitem" className="flex-row items-center justify-center gap-2 px-4 py-4" onPress={()=>{setOpenCardActionsId(null);openCardForm(actionCard.column_id,actionCard);}}><Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4.8 15 4 20Z" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text className="text-black">Editar</Text></Pressable>
      {board.columns.length>1&&<Pressable accessibilityRole="menuitem" className="flex-row items-center justify-center gap-2 px-4 py-4" onPress={()=>{setOpenCardActionsId(null);moveCard(actionCard);}}><Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="M5 8h14m-4-4 4 4-4 4M19 16H5m4-4-4 4 4 4" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text className="text-black">Mover</Text></Pressable>}
      <Pressable accessibilityRole="menuitem" className="flex-row items-center justify-center gap-2 px-4 py-4" onPress={()=>{setOpenCardActionsId(null);setAssigningCard(actionCard);}}><Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="M14 20v-1a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM18 8v6m-3-3h6" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text className="text-black">Asignar</Text></Pressable>
      <Pressable accessibilityRole="menuitem" className="flex-row items-center justify-center gap-2 px-4 py-4" onPress={()=>{setOpenCardActionsId(null);confirm('Eliminar ticket',`¿Eliminar ${actionCard.title}?`,()=>run(async()=>{await request(`/boards/${board.board_id}/cards/${actionCard.card_id}`,'DELETE');await loadBoard(board.board_id);}));}}><Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="#b42318" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg><Text style={{ color: '#b42318' }}>Eliminar</Text></Pressable>
    </View>
  </View>}
  {pendingMessage&&<View accessibilityViewIsModal accessibilityRole="progressbar" accessibilityLabel={pendingMessage} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', gap: 12 }}><ActivityIndicator color="#000000" size="large" /><Text className="text-black">{pendingMessage}</Text></View>}
  {scannerOpen && <JoinScanner close={()=>setScannerOpen(false)} preview={code=>request('/invitations/preview','POST',{code})} submit={code=>request('/invitations/requests','POST',{code})}/>}
  <CenteredModal visible={inviteCode!==null} close={()=>setInviteCode(null)}><Text className="text-xl font-bold text-black">Invitación al tablero</Text><Text className="text-black">La persona interesada debe escanear este código desde Mindlog y solicitar unirse.</Text>{inviteCode && <View style={{alignItems:'center',padding:16,backgroundColor:'#ffffff'}}><QRCode value={`mindlog:join:${inviteCode}`} size={220}/></View>}<Button title="Regenerar QR" outline onPress={()=>{if(!board)return;confirm('Regenerar QR','El código anterior dejará de funcionar. Las solicitudes pendientes se conservarán.',()=>run(async()=>{const data=await request<{code:string}>(`/invitations/boards/${board.board_id}/code`,'PUT');setInviteCode(data.code);}));}}/><Button title="Cerrar" outline onPress={()=>setInviteCode(null)}/></CenteredModal>
  <FormModal form={form} close={()=>setForm(null)}/>
  {assigningCard && board && <AssignMembersModal card={assigningCard} board={board} close={()=>setAssigningCard(null)} save={async(cardId,userIds)=>{await request(`/boards/${board.board_id}/cards/${cardId}/assignments`,'PUT',{user_ids:userIds});await loadBoard(board.board_id);}}/>}
  <AssignedMembersModal members={viewedMembers} close={()=>setViewingCardId(null)}/>
  <Modal visible={!!movingCard} animationType="slide" onRequestClose={()=>setMovingCard(null)}><SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}><ScrollView contentContainerStyle={{padding:24,gap:12}}><Text className="text-2xl font-bold text-black">Mover ticket</Text>{board?.columns.filter(c=>c.column_id!==movingCard?.column_id).map(column=><Button key={column.column_id} title={column.title} outline onPress={()=>{const card=movingCard;setMovingCard(null);if(card)run(async()=>{await request(`/boards/${board.board_id}/cards/${card.card_id}`,'PUT',{...card,column_id:column.column_id});await loadBoard(board.board_id);});}}/>)}<Button title="Cancelar" onPress={()=>setMovingCard(null)}/></ScrollView></SafeAreaView></Modal>
  </SafeAreaView>;
}
