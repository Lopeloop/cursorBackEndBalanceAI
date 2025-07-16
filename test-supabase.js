const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL или SUPABASE_ANON_KEY не найдены в .env файле');
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
    } else {
      console.log('✅ Подключение к Supabase успешно!');
      console.log('📊 Таблицы доступны');
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  }
}

testSupabaseConnection(); 