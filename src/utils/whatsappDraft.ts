/**
 * Utility helper to generate standardized, professional WhatsApp message drafts
 * for Service Advisors to send work order status updates directly to customers.
 */

export const generateWAStatusDraft = (
  wo: any, 
  mechanicName?: string, 
  customTrackingUrl?: string
): string => {
  const statusLabels: Record<string, string> = {
    QUEUE: 'Dalam Antrean Workshop',
    IN_PROGRESS: 'Sedang Dalam Pengerjaan / Servis',
    PENDING_APPROVAL: 'Menunggu Persetujuan / Konfirmasi Konsumen',
    PENDING_PARTS: 'Menunggu Suku Cadang / Sparepart',
    COMPLETED: 'Pengerjaan Selesai & Siap Diambil'
  };

  const statusText = statusLabels[wo.status] || wo.status || 'Sedang Diproses';
  const unitInfo = wo.plateNumber 
    ? `${wo.vehicleBrand || 'Kendaraan'} (${wo.plateNumber})` 
    : `${wo.vehicleBrand || 'Komponen Servis Diesel'}`;

  const link = customTrackingUrl || (typeof window !== 'undefined' ? `${window.location.origin}/?tracking=${wo.id}` : '');

  // Calculate estimated total if available
  const estTotal = wo.todoActions?.reduce((sum: number, act: any) => {
    const numStr = String(act.estimasiHargaMin || act.estimasiHarga || '').replace(/\D/g, '');
    const numVal = parseInt(numStr, 10);
    return sum + (isNaN(numVal) ? 0 : numVal);
  }, 0) || 0;

  let text = `*UPDATE STATUS SERVIS - INDO TEKNIK*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Yth. Bapak/Ibu *${wo.customerName || 'Pelanggan'}*,\n\n`;
  text += `Berikut kami sampaikan update status pengerjaan unit/kendaraan Anda di Bengkel Indo Teknik:\n\n`;
  text += `📋 *No. SPK / WO:* ${wo.id}\n`;
  text += `🚗 *Unit / Kendaraan:* ${unitInfo}\n`;
  text += `⚡ *Status Terkini:* *${statusText}*\n`;
  
  if (wo.currentMilestone) {
    text += `📍 *Tahap Saat Ini:* ${wo.currentMilestone}\n`;
  }
  if (mechanicName) {
    text += `👨‍🔧 *Teknisi PIC:* ${mechanicName}\n`;
  }
  if (wo.complaint) {
    text += `📝 *Keluhan / Request:* ${wo.complaint}\n`;
  }
  if (estTotal > 0) {
    text += `💰 *Estimasi Total:* Rp ${estTotal.toLocaleString('id-ID')}\n`;
  }
  text += `\n`;

  if (wo.status === 'COMPLETED') {
    text += `🎉 *Pemberitahuan:* Pengerjaan telah selesai dilakukan dan unit telah lolos pemeriksaan Quality Control (QC). Bapak/Ibu dapat mengambil unit di bengkel pada jam operasional kami.\n\n`;
  } else if (wo.status === 'PENDING_APPROVAL') {
    text += `⚠️ *Pemberitahuan:* Kami memerlukan konfirmasi & persetujuan dari Bapak/Ibu terkait estimasi biaya pengerjaan atau penggantian suku cadang sebelum tindakan dilanjutkan. Mohon kesediaannya menghubungi Service Advisor kami.\n\n`;
  } else if (wo.status === 'PENDING_PARTS') {
    text += `⏳ *Pemberitahuan:* Unit sedang menunggu ketersediaan suku cadang/komponen khusus. Tim kami akan segera melanjutkan pengerjaan begitu parts tiba di workshop.\n\n`;
  } else if (wo.status === 'IN_PROGRESS') {
    text += `🔧 *Pemberitahuan:* Unit Anda saat ini sedang dalam proses penanganan intensif oleh tim teknisi spesialis diesel kami.\n\n`;
  }

  if (link) {
    text += `🔍 *Pantau Progres Live (Live Tracking):*\n${link}\n\n`;
  }

  text += `Apabila ada pertanyaan lebih lanjut, silakan balas pesan ini atau hubungi Service Advisor kami.\n\n`;
  text += `Terima kasih atas kepercayaan Bapak/Ibu kepada *Indo Teknik*. 🙏`;

  return text;
};

/**
 * Copies the formatted WhatsApp status draft to clipboard and provides toast notification
 */
export const copyWADraftToClipboard = async (
  wo: any,
  mechanicName?: string,
  trackingUrl?: string,
  onSuccess?: (msg: string) => void
): Promise<boolean> => {
  const draft = generateWAStatusDraft(wo, mechanicName, trackingUrl);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(draft);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = draft;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (onSuccess) {
      onSuccess(`Template pesan WhatsApp untuk WO ${wo.id} (${wo.customerName}) berhasil disalin!`);
    }
    return true;
  } catch (err) {
    console.error('Failed to copy WA draft to clipboard:', err);
    return false;
  }
};
