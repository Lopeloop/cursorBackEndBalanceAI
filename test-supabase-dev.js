const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  console.log('🔍 Проверка конфигурации Supabase...');
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Установлен' : '❌ Не установлен');

  if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your_')) {
    console.log('❌ Ключи Supabase не настроены или содержат placeholder значения');
    console.log('📋 Инструкция по настройке:');
    console.log('1. Перейдите в Settings → API в Supabase');
    console.log('2. Скопируйте anon public ключ');
    console.log('3. Обновите SUPABASE_ANON_KEY в .env файле');
    console.log('4. Запустите тест снова');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Тестирование подключения к Supabase...');
    
    // Тест подключения
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Ошибка подключения:', error.message);
      console.log('💡 Возможные причины:');
      console.log('- SQL скрипт не выполнен в Supabase');
      console.log('- Неправильные ключи API');
      console.log('- Проблемы с сетью');
    } else {
      console.log('✅ Подключение к Supabase успешно!');
      console.log('📊 Таблицы доступны');
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  }
}

testSupabaseConnection(); 