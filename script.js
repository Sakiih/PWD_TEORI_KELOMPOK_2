/*!
 * Spill Bill Here — script.js
 * ---------------------------------------------------------------
 * Bagian 1 : CORE   — logika murni (validasi, periode, ringkasan, storage)
 * Bagian 2 : TESTS  — 30 tes otomatis, jalankan dengan membuka index.html#test
 *                     lalu lihat hasilnya di Console (F12)
 * Bagian 3 : UI     — jQuery (UC-01 s/d UC-05)
 *
 * Pemetaan use case:
 *   UC-01 Tambah  → submit form → SpillBill.validateTransaction
 *   UC-02 Lihat   → renderList (empty state, badge & tanda +/−)
 *   UC-03 Edit    → tombol edit → form terisi → simpan perubahan
 *   UC-04 Hapus   → modal konfirmasi (Batal / Esc / klik latar = tidak dihapus)
 *   UC-05 Ringkas → tab periode → SpillBill.summarize
 *
 * Keputusan desain:
 *   - Tanggal disimpan sebagai 'YYYY-MM-DD' → filter periode bebas masalah zona waktu.
 *   - Jumlah = bilangan bulat rupiah, maks Rp999.999.999.999. "1.500.000" diterima, desimal ditolak.
 *   - Jenis transaksi tidak dipilih default agar validasi "harus memilih jenis" berlaku.
 *   - Data rusak di localStorage disaring; keterangan dirender dengan .text() (aman XSS).


/*
  SPILL BILL HERE
  JavaScript dasar + jQuery

  Materi:
  1. Selector
  2. Event
  3. Manipulasi DOM
  4. Validasi form
  5. Penyimpanan data di browser
*/

$(document).ready(function () {

  // =====================================
  // 1. DATA APLIKASI
  // =====================================

  var storageKey = 'spillbill.transactions.v1';
  var transactions = [];
  var selectedPeriod = 'monthly';
  var activeFilter = 'all';
  var editingId = null;
  var deletingId = null;

  var today = getToday();

  var references = {
    daily: today,
    monthly: today.substring(0, 7),
    yearly: today.substring(0, 4)
  };

  var months = [
    'Januari', 'Februari', 'Maret', 'April',
    'Mei', 'Juni', 'Juli', 'Agustus',
    'September', 'Oktober', 'November', 'Desember'
  ];


  // =====================================
  // 2. FUNGSI BANTU
  // =====================================

  // Mengambil tanggal hari ini.
  function getToday() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }

    return year + '-' + month + '-' + day;
  }


  // Mengubah angka menjadi format Rupiah.
  function formatRupiah(amount) {
    return 'Rp' + Number(amount).toLocaleString('id-ID');
  }


  // Mengubah tanggal menjadi tulisan yang mudah dibaca.
  function formatDate(value) {
    var parts = value.split('-');
    var day = Number(parts[2]);
    var month = Number(parts[1]);
    var year = parts[0];

    return day + ' ' + months[month - 1] + ' ' + year;
  }


  // Mengubah tanggal menjadi YYYY-MM-DD.
  function dateToString(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }

    return year + '-' + month + '-' + day;
  }


  // Mencari transaksi berdasarkan ID.
  function findTransaction(id) {
    for (var i = 0; i < transactions.length; i++) {
      if (transactions[i].id === id) {
        return transactions[i];
      }
    }

    return null;
  }


  // Membaca data dari localStorage.
  function loadTransactions() {
    try {
      var savedData = localStorage.getItem(storageKey);

      if (savedData) {
        var parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
          transactions = parsedData;
        }
      }
    } catch (error) {
      transactions = [];
    }
  }


  // Menyimpan transaksi ke localStorage.
  function saveTransactions() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(transactions)
      );
    } catch (error) {
      showToast('Data gagal disimpan di browser.', 'error');
    }
  }


  // Menampilkan notifikasi.
  function showToast(message, type) {
    var $toast = $('#toast');

    $toast.attr('class', 'toast');
    $toast.text(message);

    if (type) {
      $toast.addClass('toast--' + type);
    }

    $toast.prop('hidden', false);

    setTimeout(function () {
      $toast.prop('hidden', true);
    }, 2500);
  }


  // =====================================
  // 3. RINGKASAN KEUANGAN
  // =====================================

  // Mengecek transaksi berdasarkan periode.
  function isInPeriod(transaction) {
    var reference = references[selectedPeriod];

    if (selectedPeriod === 'daily') {
      return transaction.date === reference;
    }

    if (selectedPeriod === 'monthly') {
      return transaction.date.substring(0, 7) === reference;
    }

    return transaction.date.substring(0, 4) === reference;
  }


  // Membuat label periode.
  function getPeriodLabel() {
    var reference = references[selectedPeriod];

    if (selectedPeriod === 'daily') {
      return formatDate(reference);
    }

    if (selectedPeriod === 'monthly') {
      var parts = reference.split('-');

      return months[Number(parts[1]) - 1] + ' ' + parts[0];
    }

    return 'Tahun ' + reference;
  }


  // Menghitung total pemasukan dan pengeluaran.
  function renderSummary() {
    var income = 0;
    var expense = 0;
    var count = 0;

    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      if (isInPeriod(transaction)) {
        count++;

        if (transaction.type === 'income') {
          income = income + Number(transaction.amount);
        } else {
          expense = expense + Number(transaction.amount);
        }
      }
    }

    var net = income - expense;

    $('#sum-income').text(formatRupiah(income));
    $('#sum-expense').text(formatRupiah(expense));
    $('#sum-net')
      .text(formatRupiah(net))
      .toggleClass('is-negative', net < 0);

    $('#sum-count').text(
      count + ' transaksi pada periode ini'
    );

    $('#period-label').text(getPeriodLabel());


    // Menandai tab periode yang aktif.
    $('#period-tabs .tab').each(function () {
      var isActive =
        $(this).data('period') === selectedPeriod;

      $(this).toggleClass('is-active', isActive);

      $(this).attr(
        'aria-selected',
        isActive ? 'true' : 'false'
      );
    });


    // Menampilkan input sesuai periode.
    $('#ref-daily')
      .val(references.daily)
      .prop('hidden', selectedPeriod !== 'daily');

    $('#ref-monthly')
      .val(references.monthly)
      .prop('hidden', selectedPeriod !== 'monthly');

    $('#ref-yearly')
      .val(references.yearly)
      .prop('hidden', selectedPeriod !== 'yearly');


    // Mengubah tulisan tombol kembali ke periode sekarang.
    if (selectedPeriod === 'daily') {
      $('#ref-today').text('Hari ini');
    } else if (selectedPeriod === 'monthly') {
      $('#ref-today').text('Bulan ini');
    } else {
      $('#ref-today').text('Tahun ini');
    }
  }


  // Menggeser periode sebelumnya atau berikutnya.
  function movePeriod(amount) {
    var reference = references[selectedPeriod];
    var parts = reference.split('-');
    var newDate;

    if (selectedPeriod === 'daily') {

      newDate = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]) + amount
      );

      references.daily = dateToString(newDate);

    } else if (selectedPeriod === 'monthly') {

      newDate = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1 + amount,
        1
      );

      references.monthly =
        dateToString(newDate).substring(0, 7);

    } else {

      references.yearly =
        String(Number(reference) + amount);

    }

    renderSummary();
  }


  // Event untuk tab harian, bulanan, dan tahunan.
  $('#period-tabs').on('click', '.tab', function () {
    selectedPeriod = $(this).data('period');
    renderSummary();
  });


  // Event ketika tanggal, bulan, atau tahun diubah.
  $('#ref-daily, #ref-monthly, #ref-yearly')
    .on('change', function () {

      var period = this.id.substring(4);
      var value = $(this).val();

      if (value !== '') {
        if (
          period === 'daily' &&
          /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          references.daily = value;
        }

        if (
          period === 'monthly' &&
          /^\d{4}-\d{2}$/.test(value)
        ) {
          references.monthly = value;
        }

        if (
          period === 'yearly' &&
          /^\d{4}$/.test(value)
        ) {
          references.yearly = value;
        }
      }

      renderSummary();
    });


  $('#ref-prev').on('click', function () {
    movePeriod(-1);
  });

  $('#ref-next').on('click', function () {
    movePeriod(1);
  });

  $('#ref-today').on('click', function () {
    today = getToday();

    if (selectedPeriod === 'daily') {
      references.daily = today;
    }

    if (selectedPeriod === 'monthly') {
      references.monthly = today.substring(0, 7);
    }

    if (selectedPeriod === 'yearly') {
      references.yearly = today.substring(0, 4);
    }

    renderSummary();
  });


  // =====================================
  // 4. DAFTAR TRANSAKSI
  // =====================================

  // Membuat tampilan satu transaksi.
  function createTransactionItem(transaction) {
    var type = transaction.type;
    var typeText;
    var sign;

    if (type === 'income') {
      typeText = 'Pemasukan';
      sign = '+';
    } else {
      typeText = 'Pengeluaran';
      sign = '−';
    }

    var $item = $('<li></li>')
      .addClass('tx tx--' + type)
      .attr('data-id', transaction.id);

    if (editingId === transaction.id) {
      $item.addClass('is-editing');
    }


    // Ikon transaksi.
    var $icon = $('<div></div>')
      .addClass('tx__icon')
      .text(type === 'income' ? '↑' : '↓');

    $item.append($icon);


    // Keterangan transaksi.
    var $body = $('<div></div>').addClass('tx__body');

    var note = transaction.note
      ? transaction.note
      : 'Tanpa keterangan';

    var $note = $('<p></p>')
      .addClass('tx__note')
      .text(note);

    if (!transaction.note) {
      $note.addClass('is-empty');
    }

    $body.append($note);


    // Jenis dan tanggal transaksi.
    var $meta = $('<p></p>').addClass('tx__meta');

    var $badge = $('<span></span>')
      .addClass('badge badge--' + type)
      .text(typeText);

    var $date = $('<time></time>')
      .attr('datetime', transaction.date)
      .text(formatDate(transaction.date));

    $meta.append($badge, $date);
    $body.append($meta);
    $item.append($body);


    // Jumlah uang.
    var $amount = $('<div></div>')
      .addClass('tx__amount')
      .text(sign + formatRupiah(transaction.amount));

    $item.append($amount);


    // Tombol edit dan hapus.
    var $actions = $('<div></div>').addClass('tx__actions');

    var $editButton = $(
      '<button type="button" title="Edit" aria-label="Edit transaksi">✎</button>'
    ).addClass('icon-btn js-edit');

    var $deleteButton = $(
      '<button type="button" title="Hapus" aria-label="Hapus transaksi">×</button>'
    ).addClass('icon-btn js-delete');

    $actions.append($editButton, $deleteButton);
    $item.append($actions);

    return $item;
  }


  // Menampilkan daftar transaksi.
  function renderList() {
    var $list = $('#tx-list');
    var visibleCount = 0;

    // Urutkan tanggal dari terbaru ke terlama.
    transactions.sort(function (a, b) {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;

      return Number(b.createdAt || 0) -
        Number(a.createdAt || 0);
    });

    $list.empty();

    $('#list-count').text(
      transactions.length + ' transaksi tercatat'
    );


    // Mengaktifkan tombol filter yang dipilih.
    $('#filters .filter').each(function () {
      $(this).toggleClass(
        'is-active',
        $(this).data('filter') === activeFilter
      );
    });


    // Memasukkan transaksi ke dalam daftar.
    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      if (
        activeFilter === 'all' ||
        transaction.type === activeFilter
      ) {
        $list.append(createTransactionItem(transaction));
        visibleCount++;
      }
    }


    // Menampilkan pesan jika daftar kosong.
    if (visibleCount === 0) {
      $('#empty').prop('hidden', false);

      if (transactions.length === 0) {
        $('#empty-title').text(
          'Catatan keuangan masih kosong'
        );

        $('#empty-text').text(
          'Tambahkan transaksi pertamamu lewat formulir.'
        );
      } else {
        $('#empty-title').text(
          'Tidak ada transaksi pada filter ini'
        );

        $('#empty-text').text(
          'Coba pilih filter "Semua".'
        );
      }

    } else {
      $('#empty').prop('hidden', true);
    }
  }


  // Event untuk filter transaksi.
  $('#filters').on('click', '.filter', function () {
    activeFilter = $(this).data('filter');
    renderList();
  });


  // =====================================
  // 5. VALIDASI FORM
  // =====================================

  // Memeriksa apakah satu input sudah benar.
  function getError(field) {

    if (
      field === 'type' &&
      !$('input[name="type"]:checked').val()
    ) {
      return 'Pilih pemasukan atau pengeluaran.';
    }

    if (field === 'amount') {
      var value = $('#amount').val()
        .replace(/\./g, '')
        .trim();

      var amount = Number(value);

      if (value === '') {
        return 'Jumlah uang harus diisi.';
      }

      if (isNaN(amount) || amount <= 0) {
        return 'Jumlah uang harus lebih besar dari nol.';
      }

      if (amount > 999999999999) {
        return 'Jumlah maksimal adalah Rp999.999.999.999.';
      }
    }

    if (
      field === 'date' &&
      $('#date').val() === ''
    ) {
      return 'Tanggal transaksi harus diisi.';
    }

    return '';
  }


  // Menampilkan pesan error di bawah input.
  function showError(field, message) {
    $('#err-' + field).text(message);

    var $control;

    if (field === 'type') {
      $control = $('#type-group');
    } else {
      $control = $('#' + field);
    }

    $control.toggleClass('is-invalid', message !== '');

    $control.attr(
      'aria-invalid',
      message !== '' ? 'true' : 'false'
    );

    if (field === 'amount') {
      $control.closest('.input-wrap')
        .toggleClass('is-invalid', message !== '');
    }
  }


  // Menjalankan validasi pada satu kolom.
  function validateField(field) {
    var message = getError(field);
    showError(field, message);

    return message === '';
  }


  // Validasi ketika input berubah.
  $('#amount, #date, #note').on('input change', function () {
    validateField(this.id);
  });

  $('input[name="type"]').on('change', function () {
    validateField('type');
  });


  // Format angka saat user mengetik.
  $('#amount').on('input', function () {
    var numbers = $(this).val().replace(/\D/g, '');

    if (numbers === '') {
      $(this).val('');
    } else {
      $(this).val(Number(numbers).toLocaleString('id-ID'));
    }

    validateField('amount');
  });


  // Mengatur tampilan form tambah dan edit.
  function setEditMode(isEditing) {
    $('#form-card').toggleClass('is-editing', isEditing);

    $('#form-title').text(
      isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'
    );

    $('#submit-label').text(
      isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi'
    );

    $('#edit-badge').prop('hidden', !isEditing);
    $('#cancel-edit').prop('hidden', !isEditing);
  }


  // Mengosongkan form.
  function resetForm() {
    $('#tx-form')[0].reset();

    $('input[name="type"]').prop('checked', false);

    $('#amount').val('');
    $('#date').val(getToday());
    $('#note').val('');

    showError('type', '');
    showError('amount', '');
    showError('date', '');
    showError('note', '');

    editingId = null;
    setEditMode(false);
  }


  // Mengisi form ketika user memilih edit.
  function fillForm(transaction) {
    $('input[name="type"][value="' + transaction.type + '"]')
      .prop('checked', true);

    $('#amount').val(
      Number(transaction.amount).toLocaleString('id-ID')
    );

    $('#date').val(transaction.date);
    $('#note').val(transaction.note);

    showError('type', '');
    showError('amount', '');
    showError('date', '');
    showError('note', '');
  }


  // Event submit form tambah atau edit transaksi.
  $('#tx-form').on('submit', function (event) {
    event.preventDefault();

    var fields = ['type', 'amount', 'date'];
    var valid = true;
    var firstError = '';

    // Memeriksa seluruh input wajib.
    for (var i = 0; i < fields.length; i++) {
      if (!validateField(fields[i])) {
        valid = false;

        if (firstError === '') {
          firstError = fields[i];
        }
      }
    }

    if (!valid) {
      showToast(
        'Periksa kembali data transaksi kamu.',
        'error'
      );

      if (firstError === 'type') {
        $('#type-income').trigger('focus');
      } else {
        $('#' + firstError).trigger('focus');
      }

      return;
    }


    // Mengambil nilai form.
    var type = $('input[name="type"]:checked').val();

    var amount = Number(
      $('#amount').val().replace(/\./g, '')
    );

    var date = $('#date').val();
    var note = $('#note').val().trim();


    // Jika sedang edit, perbarui transaksi lama.
    if (editingId !== null) {
      var oldTransaction = findTransaction(editingId);

      if (oldTransaction !== null) {
        oldTransaction.type = type;
        oldTransaction.amount = amount;
        oldTransaction.date = date;
        oldTransaction.note = note;
      }

      showToast(
        'Perubahan transaksi berhasil disimpan.',
        'success'
      );

    } else {

      // Jika bukan edit, buat transaksi baru.
      var newTransaction = {
        id: String(new Date().getTime()),
        type: type,
        amount: amount,
        date: date,
        note: note,
        createdAt: new Date().getTime()
      };

      transactions.push(newTransaction);

      showToast(
        'Transaksi berhasil ditambahkan.',
        'success'
      );
    }


    // Simpan data dan perbarui tampilan.
    saveTransactions();
    resetForm();
    renderSummary();
    renderList();
  });


  // Membatalkan proses edit.
  $('#cancel-edit').on('click', function () {
    resetForm();
    renderList();
    showToast('Edit transaksi dibatalkan.');
  });


  // =====================================
  // 6. EDIT TRANSAKSI
  // =====================================

  // Event delegation: menangani tombol edit pada daftar.
  $('#tx-list').on('click', '.js-edit', function () {
    var id = $(this).closest('.tx').attr('data-id');
    var transaction = findTransaction(id);

    if (transaction !== null) {
      editingId = transaction.id;

      fillForm(transaction);
      setEditMode(true);
      renderList();

      $('#amount').trigger('focus');
    }
  });


  // =====================================
  // 7. HAPUS TRANSAKSI
  // =====================================

  // Membuka jendela konfirmasi.
  function openDeleteModal(transaction) {
    deletingId = transaction.id;

    var type = transaction.type === 'income'
      ? 'Pemasukan'
      : 'Pengeluaran';

    var message = type + ' ' +
      formatRupiah(transaction.amount) +
      ' • ' + formatDate(transaction.date);

    if (transaction.note) {
      message += ' • ' + transaction.note;
    }

    $('#modal-desc').text(
      message + '. Transaksi ini akan dihapus.'
    );

    $('#modal').prop('hidden', false);
    $('body').addClass('modal-open');
  }


  // Menutup jendela konfirmasi.
  function closeDeleteModal() {
    $('#modal').prop('hidden', true);
    $('body').removeClass('modal-open');
    deletingId = null;
  }


  // Klik tombol hapus.
  $('#tx-list').on('click', '.js-delete', function () {
    var id = $(this).closest('.tx').attr('data-id');
    var transaction = findTransaction(id);

    if (transaction !== null) {
      openDeleteModal(transaction);
    }
  });


  // Membatalkan penghapusan.
  $('#modal-cancel, #modal-backdrop').on('click', function () {
    closeDeleteModal();
  });


  // Menghapus transaksi setelah konfirmasi.
  $('#modal-confirm').on('click', function () {
    if (deletingId === null) {
      return;
    }

    for (var i = 0; i < transactions.length; i++) {
      if (transactions[i].id === deletingId) {
        transactions.splice(i, 1);
        break;
      }
    }

    if (editingId === deletingId) {
      resetForm();
    }

    closeDeleteModal();
    saveTransactions();
    renderSummary();
    renderList();

    showToast('Transaksi berhasil dihapus.', 'success');
  });


  // =====================================
  // 8. MENJALANKAN APLIKASI
  // =====================================

  loadTransactions();

  $('#year').text(new Date().getFullYear());

  resetForm();
  renderSummary();
  renderList();

});
