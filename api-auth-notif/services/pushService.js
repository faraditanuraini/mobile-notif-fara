export async function kirimExpoPush(expoPushToken, pesan) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: pesan.title,
      body: pesan.body,
      data: pesan.data || {},
    }),
  });

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Respon server Expo bukan JSON (404/Error): ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(`Gagal mengirim ke Expo: ${JSON.stringify(result)}`);
  }
  
  return result;
}