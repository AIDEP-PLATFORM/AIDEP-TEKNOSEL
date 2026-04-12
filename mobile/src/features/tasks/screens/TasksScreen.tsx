import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../../shared/components/Icon';
import colors from '../../../shared/theme/colors';
import { useAuthStore } from '../../../core/stores/auth.store';
import TopBar from '../../../shared/components/TopBar';
import FloatingBubbles from '../../../shared/components/FloatingBubbles';

// ─── Citizen ──────────────────────────────────────────────────────────────────
const infoCards = [
  { icon: 'users' as const,         title: 'Ekip Üyeliği',      desc: 'Bir STK veya yetkili kurum tarafından ekibinize davet edilmeniz gerekmektedir.', color: '#1976D2', bg: '#EBF8FF' },
  { icon: 'mapPin' as const,        title: 'Saha Görevleri',    desc: 'Ekibinize atanan aktif görevler ve saha operasyonları burada listelenecektir.',  color: '#059669', bg: '#ECFDF5' },
  { icon: 'alertTriangle' as const, title: 'Acil Koordinasyon', desc: 'Afet anında ekip koordinasyonu ve anlık iletişim araçlarına buradan ulaşabilirsiniz.', color: '#DD6B20', bg: '#FFFAF0' },
];

function CitizenView() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.emptyBox}>
        <LinearGradient colors={['#EBF8FF', '#F0FFF4']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.emptyIconWrap}>
          <Icon name="users" size={40} color="#94A3B8" strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>Henüz Bir Ekibiniz Yok</Text>
        <Text style={styles.emptyDesc}>
          Herhangi bir STK veya yetkili kuruma üye olmadığınız için ekibiniz bulunmamaktadır.
          Bir kurum sizi ekibine davet ettiğinde burada görünecektir.
        </Text>
        <View style={styles.emptyBadge}>
          <View style={[styles.emptyBadgeDot, { backgroundColor: '#1976D2' }]} />
          <Text style={styles.emptyBadgeText}>Normal Kullanıcı</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <LinearGradient colors={['#1976D2', '#63B3ED']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>EKİP ÖZELLİKLERİ</Text>
      </View>

      {infoCards.map((card, i) => (
        <TouchableOpacity key={i} activeOpacity={0.85} style={styles.infoCard}>
          <View style={[styles.infoIconWrap, { backgroundColor: card.bg }]}>
            <Icon name={card.icon} size={24} color={card.color} strokeWidth={2} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{card.title}</Text>
            <Text style={styles.infoDesc}>{card.desc}</Text>
          </View>
          <Icon name="chevronRight" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity activeOpacity={0.85} style={styles.reportWrapper}>
        <LinearGradient colors={['#1565C0', '#2196F3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.reportBtn}>
          <Icon name="alertTriangle" size={20} color="#fff" strokeWidth={2.5} />
          <Text style={styles.reportBtnText}>Durum Raporla</Text>
          <View style={styles.reportArrow}>
            <Icon name="chevronRight" size={18} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

// ─── Volunteer ────────────────────────────────────────────────────────────────
const volunteerTasks = [
  { id: '1', title: 'Enkaz Tarama - Bölge 3', status: 'active',  priority: 'high',   location: 'Kahramanmaraş, Merkez', assigned: '8 kişi',  time: '09:00 - 18:00' },
  { id: '2', title: 'İaşe Dağıtımı',          status: 'active',  priority: 'medium', location: 'Gaziantep, Şahinbey',   assigned: '12 kişi', time: '10:00 - 16:00' },
  { id: '3', title: 'Tıbbi Tarama Noktası',   status: 'waiting', priority: 'high',   location: 'Adıyaman, Merkez',      assigned: '5 kişi',  time: '08:00 - 20:00' },
  { id: '4', title: 'Barınak Kurulumu',        status: 'done',    priority: 'low',    location: 'Malatya, Battalgazi',   assigned: '20 kişi', time: 'Tamamlandı'    },
];

const volunteerMembers = [
  { name: 'Ahmet Yılmaz', role: 'Ekip Lideri',      status: 'active' },
  { name: 'Fatma Kaya',   role: 'Sağlık Görevlisi', status: 'active' },
  { name: 'Mehmet Demir', role: 'Lojistik',          status: 'away'   },
  { name: 'Ayşe Çelik',  role: 'İletişim',          status: 'active' },
];

const myStatuses = [
  { key: 'available', label: 'Müsait',          color: '#059669', bg: '#ECFDF5', icon: 'checkCircle'   as const },
  { key: 'on_duty',   label: 'Görevde',          color: '#1976D2', bg: '#EFF6FF', icon: 'shield'        as const },
  { key: 'need_help', label: 'Yardım Gerekli',   color: '#DC2626', bg: '#FEF2F2', icon: 'alertTriangle' as const },
];

// STK kapasite kaynakları
const resources = [
  { key: 'people',    label: 'Personel',   icon: 'users'         as const, value: 5,  unit: 'kişi' },
  { key: 'vehicles',  label: 'Araç',       icon: 'mapPin'        as const, value: 2,  unit: 'adet' },
  { key: 'equipment', label: 'Ekipman',    icon: 'shield'        as const, value: 8,  unit: 'adet' },
];

function VolunteerView() {
  const [myStatus, setMyStatus] = useState('available');
  const [resourceValues, setResourceValues] = useState({ people: 5, vehicles: 2, equipment: 8 });

  const statusColor: Record<string, string> = { active: '#059669', waiting: '#D97706', done: '#94A3B8' };
  const statusLabel: Record<string, string> = { active: 'Aktif', waiting: 'Bekliyor', done: 'Tamamlandı' };
  const priorityColor: Record<string, string> = { high: '#DC2626', medium: '#D97706', low: '#059669' };

  const updateResource = (key: string, delta: number) => {
    setResourceValues(prev => ({ ...prev, [key]: Math.max(0, (prev as any)[key] + delta) }));
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

      {/* ── Durum Bildirimi ── */}
      <View style={styles.sectionHeader}>
        <LinearGradient colors={['#059669', '#34D399']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>DURUMUM</Text>
      </View>
      <View style={styles.statusRow}>
        {myStatuses.map(s => (
          <TouchableOpacity key={s.key} activeOpacity={0.8} onPress={() => setMyStatus(s.key)}
            style={[styles.statusChip, { borderColor: s.color, backgroundColor: myStatus === s.key ? s.color : s.bg }]}
          >
            <Icon name={s.icon} size={15} color={myStatus === s.key ? '#fff' : s.color} strokeWidth={2} />
            <Text style={[styles.statusChipText, { color: myStatus === s.key ? '#fff' : s.color }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Özet istatistik ── */}
      <View style={styles.teamSummaryRow}>
        {[
          { num: '3', label: 'Aktif Görev', color: '#1976D2' },
          { num: '4', label: 'Ekip Üyesi', color: '#059669' },
          { num: '12', label: 'Tamamlanan', color: '#D97706' },
        ].map((s, i) => (
          <LinearGradient key={i} colors={[s.color + '18', s.color + '08']} style={[styles.summaryCard, { borderTopColor: s.color }]}>
            <Text style={[styles.summaryNum, { color: s.color }]}>{s.num}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* ── Ekip ── */}
      <View style={styles.teamNameCard}>
        <View style={styles.teamNameLeft}>
          <View style={[styles.teamDot, { backgroundColor: '#059669' }]} />
          <View>
            <Text style={styles.teamName}>AKUT Kahramanmaraş</Text>
            <Text style={styles.teamSub}>Arama Kurtarma Ekibi • Aktif</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.teamDetailBtn} activeOpacity={0.7}>
          <Text style={styles.teamDetailBtnText}>Detay</Text>
        </TouchableOpacity>
      </View>

      {/* ── Kapasite beyanı ── */}
      <View style={styles.sectionHeader}>
        <LinearGradient colors={['#D97706', '#FCD34D']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>KAPASİTE BEYANI</Text>
      </View>
      <View style={styles.capacityCard}>
        <Text style={styles.capacityNote}>Sahaya getirdiğiniz kaynak bilgilerini güncelleyin</Text>
        {resources.map(r => (
          <View key={r.key} style={styles.capacityRow}>
            <View style={[styles.capacityIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon name={r.icon} size={18} color="#D97706" strokeWidth={2} />
            </View>
            <Text style={styles.capacityLabel}>{r.label}</Text>
            <View style={styles.capacityCounter}>
              <TouchableOpacity onPress={() => updateResource(r.key, -1)} style={styles.counterBtn}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterVal}>{(resourceValues as any)[r.key]} {r.unit}</Text>
              <TouchableOpacity onPress={() => updateResource(r.key, 1)} style={styles.counterBtn}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity activeOpacity={0.85} style={styles.capacityBtn}
          onPress={() => Alert.alert('Güncellendi', 'Kapasite bilgileriniz sisteme iletildi.')}
        >
          <LinearGradient colors={['#D97706', '#F59E0B']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.capacityBtnGrad}>
            <Icon name="checkCircle" size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.capacityBtnText}>Kapasiteyi Güncelle</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Görevler ── */}
      <View style={styles.sectionHeader}>
        <LinearGradient colors={['#1976D2', '#60A5FA']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>GÖREVLER</Text>
      </View>
      {volunteerTasks.map((task) => (
        <TouchableOpacity key={task.id} activeOpacity={0.85} style={styles.taskCard}>
          <View style={styles.taskCardTop}>
            <View style={styles.taskCardTitleRow}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor[task.priority] }]} />
              <Text style={styles.taskCardTitle} numberOfLines={1}>{task.title}</Text>
            </View>
            <View style={[styles.taskStatusBadge, { backgroundColor: statusColor[task.status] + '20' }]}>
              <Text style={[styles.taskStatusText, { color: statusColor[task.status] }]}>{statusLabel[task.status]}</Text>
            </View>
          </View>
          <View style={styles.taskCardMeta}>
            <View style={styles.taskMetaItem}>
              <Icon name="mapPin" size={13} color={colors.textMuted} />
              <Text style={styles.taskMetaText}>{task.location}</Text>
            </View>
            <View style={styles.taskMetaItem}>
              <Icon name="users" size={13} color={colors.textMuted} />
              <Text style={styles.taskMetaText}>{task.assigned}</Text>
            </View>
          </View>
          <Text style={styles.taskTime}>{task.time}</Text>
        </TouchableOpacity>
      ))}

      {/* ── Ekip üyeleri ── */}
      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <LinearGradient colors={['#6B46C1', '#A78BFA']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>EKİP ÜYELERİ</Text>
      </View>
      {volunteerMembers.map((m, i) => (
        <View key={i} style={styles.memberCard}>
          <View style={[styles.memberAvatar, { backgroundColor: m.status === 'active' ? '#DBEAFE' : '#FEF3C7' }]}>
            <Text style={[styles.memberAvatarText, { color: m.status === 'active' ? '#1976D2' : '#D97706' }]}>
              {m.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{m.name}</Text>
            <Text style={styles.memberRole}>{m.role}</Text>
          </View>
          <View style={[styles.memberStatusPill, { backgroundColor: m.status === 'active' ? '#ECFDF5' : '#FEF3C7' }]}>
            <View style={[styles.memberStatusDot, { backgroundColor: m.status === 'active' ? '#059669' : '#D97706' }]} />
            <Text style={[styles.memberStatusText, { color: m.status === 'active' ? '#059669' : '#D97706' }]}>
              {m.status === 'active' ? 'Aktif' : 'Uzakta'}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
const adminTeams = [
  { id: '1', name: 'AKUT Kahramanmaraş', type: 'Arama Kurtarma', members: 18, active: true,  tasks: 5 },
  { id: '2', name: 'Kızılay Gönüllüleri', type: 'Sağlık & İaşe', members: 34, active: true,  tasks: 8 },
  { id: '3', name: 'AFAD Koordinasyon',   type: 'Koordinasyon',   members: 12, active: false, tasks: 2 },
  { id: '4', name: 'Lojistik Destek',     type: 'Malzeme',        members: 9,  active: true,  tasks: 3 },
];

const adminStats = [
  { label: 'Toplam Ekip', value: '4',  color: '#1976D2', bg: '#EFF6FF', icon: 'users'       as const },
  { label: 'Aktif Görev', value: '18', color: '#059669', bg: '#ECFDF5', icon: 'checkCircle' as const },
  { label: 'Toplam Üye',  value: '73', color: '#D97706', bg: '#FEF3C7', icon: 'user'        as const },
  { label: 'Bölge',       value: '6',  color: '#7C3AED', bg: '#EDE9FE', icon: 'mapPin'      as const },
];

function AdminView() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.adminStatsGrid}>
        {adminStats.map((s, i) => (
          <LinearGradient key={i} colors={[s.color + '18', s.color + '08']}
            style={[styles.adminStatCard, { borderLeftColor: s.color }]}>
            <View style={[styles.adminStatIconWrap, { backgroundColor: s.bg }]}>
              <Icon name={s.icon} size={20} color={s.color} strokeWidth={2} />
            </View>
            <Text style={[styles.adminStatNum, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.adminStatLabel}>{s.label}</Text>
          </LinearGradient>
        ))}
      </View>

      <View style={styles.adminActionRow}>
        <TouchableOpacity activeOpacity={0.85} style={styles.adminActionBtn}
          onPress={() => Alert.alert('Acil Alarm', 'Tüm ekiplere acil alarm gönderildi!')}>
          <LinearGradient colors={['#DC2626', '#EF4444']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.adminActionGrad}>
            <Icon name="alertTriangle" size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.adminActionText}>Acil Alarm</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.adminActionBtn}
          onPress={() => Alert.alert('Ekip Ata', 'Ekip atama ekranı yakında aktif olacak.')}>
          <LinearGradient colors={['#1565C0', '#1976D2']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.adminActionGrad}>
            <Icon name="users" size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.adminActionText}>Ekip Ata</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <LinearGradient colors={['#1976D2', '#60A5FA']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
        <Text style={styles.sectionLabel}>YÖNETİLEN EKİPLER</Text>
      </View>
      {adminTeams.map((team) => (
        <TouchableOpacity key={team.id} activeOpacity={0.85} style={styles.adminTeamCard}>
          <View style={styles.adminTeamLeft}>
            <View style={[styles.adminTeamDot, { backgroundColor: team.active ? '#059669' : '#94A3B8' }]} />
            <View>
              <Text style={styles.adminTeamName}>{team.name}</Text>
              <Text style={styles.adminTeamType}>{team.type}</Text>
            </View>
          </View>
          <View style={styles.adminTeamRight}>
            <View style={styles.adminTeamBadge}>
              <Icon name="users" size={12} color="#64748B} " />
              <Text style={styles.adminTeamBadgeText}>{team.members}</Text>
            </View>
            <View style={[styles.adminTeamBadge, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="checkCircle" size={12} color="#1976D2" />
              <Text style={[styles.adminTeamBadgeText, { color: '#1976D2' }]}>{team.tasks} görev</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity activeOpacity={0.85} style={styles.addTeamBtn}
        onPress={() => Alert.alert('Yeni Ekip', 'Ekip oluşturma özelliği yakında aktif olacak.')}>
        <Icon name="users" size={20} color="#1976D2" strokeWidth={2} />
        <Text style={styles.addTeamBtnText}>Yeni Ekip Oluştur</Text>
        <Icon name="chevronRight" size={18} color="#1976D2" />
      </TouchableOpacity>

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

// ─── Ana ekran ────────────────────────────────────────────────────────────────
const roleConfig: Record<string, { gradient: [string, string, string]; heroSub: string; badge: string; badgeColor: string }> = {
  citizen:   { gradient: ['#1565C0', '#1976D2', '#2196F3'], heroSub: 'Ekip yönetimi ve görev koordinasyonu',   badge: 'Normal Kullanıcı',  badgeColor: '#1976D2' },
  volunteer: { gradient: ['#1B5E20', '#2E7D32', '#43A047'], heroSub: 'Saha görevleri ve ekip koordinasyonu',   badge: 'STK Gönüllüsü',     badgeColor: '#059669' },
  admin:     { gradient: ['#4A148C', '#7B1FA2', '#AB47BC'], heroSub: 'Tüm ekipleri ve operasyonları yönetin',  badge: 'Yetkili Kullanıcı', badgeColor: '#7C3AED' },
};

export default function TasksScreen() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'citizen';
  const cfg = roleConfig[role] ?? roleConfig.citizen;

  return (
    <View style={styles.container}>
      <LinearGradient colors={cfg.gradient} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      <FloatingBubbles />

      {/* Hero */}
      <View style={styles.heroSection}>
        <TopBar tint="light" />
        <View style={styles.heroRow}>
          <View style={styles.heroIconWrap}>
            <Icon name="users" size={26} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Ekibim</Text>
            <Text style={styles.heroSub}>{cfg.heroSub}</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: cfg.badgeColor + '33', borderColor: cfg.badgeColor + '66' }]}>
            <View style={[styles.heroBadgeDot, { backgroundColor: cfg.badgeColor }]} />
            <Text style={styles.heroBadgeText}>{cfg.badge}</Text>
          </View>
        </View>
      </View>

      {/* Kart alanı */}
      <View style={styles.cardArea}>
        <View style={styles.pullHandle} />
        {role === 'citizen'   && <CitizenView />}
        {role === 'volunteer' && <VolunteerView />}
        {role === 'admin'     && <AdminView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  heroSection: { paddingBottom: 20 },
  heroRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 10,
  },
  heroIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  cardArea: {
    flex: 1, backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20,
  },
  pullHandle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#D1D9E6', alignSelf: 'center',
    marginTop: 12, marginBottom: 18,
  },
  scrollContent: { paddingHorizontal: 18 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 6 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#4A5568', letterSpacing: 1.2 },

  // Citizen
  emptyBox: {
    borderRadius: 24, padding: 26, alignItems: 'center', marginBottom: 24,
    borderWidth: 1.5, borderColor: '#BFDBFE', overflow: 'hidden',
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 18 },
  emptyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#DBEAFE', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  emptyBadgeDot: { width: 8, height: 8, borderRadius: 4 },
  emptyBadgeText: { fontSize: 13, fontWeight: '800', color: '#1E40AF' },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  infoIconWrap: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  infoDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  reportWrapper: { marginTop: 8 },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: 22, paddingRight: 16, paddingVertical: 17,
    borderRadius: 20, gap: 12,
    shadowColor: '#1976D2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  reportBtnText: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '800' },
  reportArrow: {
    width: 34, height: 34, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },

  // Volunteer - durum
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statusChipText: { fontSize: 13, fontWeight: '800' },

  teamSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center',
    borderTopWidth: 3, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  summaryNum: { fontSize: 28, fontWeight: '900' },
  summaryLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginTop: 3 },

  teamNameCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  teamNameLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamDot: { width: 12, height: 12, borderRadius: 6 },
  teamName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  teamSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  teamDetailBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  teamDetailBtnText: { fontSize: 13, fontWeight: '700', color: '#1976D2' },

  // Kapasite
  capacityCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#FDE68A',
    shadowColor: '#D97706', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  capacityNote: { fontSize: 13, color: colors.textSecondary, marginBottom: 14 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  capacityIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  capacityLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  capacityCounter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FDE68A',
  },
  counterBtnText: { fontSize: 20, fontWeight: '700', color: '#D97706', lineHeight: 24 },
  counterVal: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, minWidth: 60, textAlign: 'center' },
  capacityBtn: { marginTop: 4 },
  capacityBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 13, borderRadius: 14,
  },
  capacityBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  taskCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  taskCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  taskCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  taskCardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  taskStatusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  taskStatusText: { fontSize: 12, fontWeight: '800' },
  taskCardMeta: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  taskMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  taskMetaText: { fontSize: 13, color: colors.textSecondary },
  taskTime: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },

  memberCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  memberAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 15, fontWeight: '900' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  memberRole: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  memberStatusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  memberStatusDot: { width: 8, height: 8, borderRadius: 4 },
  memberStatusText: { fontSize: 12, fontWeight: '700' },

  // Admin
  adminStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  adminStatCard: {
    width: '47%', borderRadius: 18, padding: 16, borderLeftWidth: 3, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  adminStatIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  adminStatNum: { fontSize: 30, fontWeight: '900' },
  adminStatLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginTop: 3 },
  adminActionRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  adminActionBtn: { flex: 1 },
  adminActionGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  adminActionText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  adminTeamCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  adminTeamLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adminTeamDot: { width: 12, height: 12, borderRadius: 6 },
  adminTeamName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  adminTeamType: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  adminTeamRight: { flexDirection: 'row', gap: 6 },
  adminTeamBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  adminTeamBadgeText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  addTeamBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#EFF6FF', borderRadius: 18, padding: 16, marginTop: 6,
    borderWidth: 1.5, borderColor: '#BFDBFE', borderStyle: 'dashed',
  },
  addTeamBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1976D2' },
});
