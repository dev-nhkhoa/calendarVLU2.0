import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'test-fixtures', 'vlu-html')

const WEEKDAYS = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Chủ Nhật']

const ALL_TIME_SLOTS = [
  '1', '1 - 2', '1 - 3', '1 - 4', '1 - 5', '1 - 6',
  '2', '2 - 3', '2 - 4', '2 - 5', '2 - 6',
  '3', '3 - 4', '3 - 5', '3 - 6',
  '4', '4 - 5', '4 - 6',
  '5', '5 - 6',
  '6',
  '7', '7 - 8', '7 - 9', '7 - 10', '7 - 11', '7 - 12', '7 - 13', '7 - 14', '7 - 15',
  '8', '8 - 9', '8 - 10', '8 - 11', '8 - 12', '8 - 13', '8 - 14', '8 - 15',
  '9', '9 - 10', '9 - 11', '9 - 12', '9 - 13', '9 - 14', '9 - 15',
  '10', '10 - 11', '10 - 12', '10 - 13', '10 - 14', '10 - 15',
  '11', '11 - 12', '11 - 13', '11 - 14', '11 - 15',
  '12', '12 - 13', '12 - 14', '12 - 15',
  '13', '13 - 14', '13 - 15',
  '14', '14 - 15',
  '15',
]

const WEEK_PATTERNS = [
  { name: 'single-week', weeks: '10' },
  { name: 'two-weeks', weeks: '03,10' },
  { name: 'consecutive-range', weeks: '01,02,03,04,05,06,07,08,09,10' },
  { name: 'scattered', weeks: '02,05,08,11' },
  { name: 'single-digit', weeks: '1,2,3,4,5' },
  { name: 'all-weeks', weeks: '01,02,03,04,05,06,07,08,09,10,11,12,13,14,15' },
  { name: 'late-weeks', weeks: '25,26,27,28,29,30,31,32,33,34,35' },
]

const ROOM_VARIANTS = [
  'CS2.A.05.08',
  'CS3.F.12.04',
  'E-LEARNING',
  'MS-TEAMS',
  'ONLINE.101',
  'ĐATN',
  '',
]

const TEACHER_VARIANTS = [
  'Nguyễn Văn A',
  'Trần Công Thanh',
  '',
]

// ─── helpers ────────────────────────────────────────────────────────────────

function studyRow(stt: number, thu: string, tiet: string, phong: string, cbgd: string, tuan: string, ghiChu = ''): string {
  return `
        <tr>
            <td style="text-align:center">${stt}</td>
            <td style="text-align:center">251_71TEST${String(stt).padStart(5, '0')}_01</td>
            <td>M&#244;n học ${stt}</td>
            <td style="text-align:center">3</td>
            <td>71K30CNTT01</td>
            <td style="text-align:center">${thu}</td>
            <td style="text-align:center">${tiet}</td>
            <td style="text-align:center">${phong}</td>
            <td>${cbgd}</td>
            <td>${tuan}</td>
            <td>${ghiChu}</td>
        </tr>`
}

function examRow(
  stt: number,
  maHP: string,
  tenHP: string,
  sbd: string,
  lanThi: string,
  ngayThi: string,
  gioThi: string,
  phongThi: string,
  ngayThiLan2: string,
  gioThiLan2: string,
  hinhThuc: string,
  thoiGian: string,
  diaDiem: string,
  kyThi: string,
  ghiChu: string,
): string {
  return `
                    <tr style="color: black; font-weight: normal">
                        <td style="text-align:center; vertical-align: middle">${stt}</td>
                        <td style="text-align:center; vertical-align: middle">${maHP}</td>
                        <td style="text-align:left; width: 15%; vertical-align: middle">${tenHP}</td>
                        <td style="text-align:center; vertical-align: middle">${sbd}</td>
                        <td style="text-align:center; width: 4%; vertical-align: middle">${lanThi}</td>
                        <td style="text-align:center; vertical-align: middle">${ngayThi}</td>
                        <td style="text-align:center; vertical-align: middle">${gioThi}</td>
                        <td style="text-align:center; vertical-align: middle">${phongThi}</td>
                        <td style="text-align:center; vertical-align: middle">${ngayThiLan2}</td>
                        <td style="text-align:center; vertical-align: middle">${gioThiLan2}</td>
                        <td style="text-align:center; vertical-align: middle">${hinhThuc}</td>
                        <td style="text-align:center; width: 6%; vertical-align: middle">${thoiGian}</td>
                        <td style="text-align:center; width: 6%; vertical-align: middle">${diaDiem}</td>
                        <td style="text-align:center; width: 10%; vertical-align: middle">${kyThi}</td>
                        <td style="text-align:center; vertical-align: middle">${ghiChu}</td>
                    </tr>`
}

function studyTemplate(title: string, yearStudy: string, termId: string, rows: string): string {
  return `

    <table width="100%" border="1" class="table table-bordered">
        <thead class="stylecolor word-color">
            <tr>
                <td colspan="11"><b>Năm học: </b>${yearStudy}  - <b>Học kỳ: </b>${termId}</td>
            </tr>
            <tr>
                <th>STT</th>
                <th>Mã lớp học phần</th>
                <th>Tên học phần</th>
                <th>STC</th>
                <th>Mã lớp</th>
                <th>Thứ</th>
                <th width="60">Tiết</th>
                <th>Phòng</th>
                <th>CBGD</th>
                <th>Tuần</th>
                <th>Ghi chú</th>
            </tr>
        </thead>
        <tbody>${rows}
        </tbody>
    </table>

`
}

function examTemplate(title: string, yearStudy: string, termId: string, rows: string): string {
  return `

    <table width="100%" border="1" class="table table-bordered table-responsive" style="overflow-x: scroll">
        <thead class="stylecolor word-color">
            <tr>
                        <th style="vertical-align: middle">STT</th>
                        <th style="width: 100px; vertical-align: middle">Mã học phần</th>
                        <th style="vertical-align: middle">Tên học phần</th>
                        <th style="vertical-align: middle">SBD</th>
                        <th style="vertical-align: middle">Lần thi</th>
                        <th style="vertical-align: middle">Ngày thi</th>
                        <th style="vertical-align: middle">Giờ thi</th>
                        <th style="vertical-align: middle">Phòng thi</th>
                        <th style="vertical-align: middle">Ngày thi<br />(Lần 2) dự kiến</th>
                        <th style="vertical-align: middle">Giờ thi<br />(Lần 2) dự kiến</th>
                        <th style="vertical-align: middle">Hình thức thi</th>
                        <th style="vertical-align: middle">Thời gian làm bài (phút)</th>
                        <th style="vertical-align: middle">Địa điểm</th>
                        <th style="vertical-align: middle">Kỳ thi</th>
                        <th style="vertical-align: middle">Ghi chú</th>
            </tr>
        </thead>
        <tbody>${rows}
        </tbody>
    </table>

`
}

function studyEmptyTemplate(): string {
  return `

    <table width="100%" border="1" class="table table-bordered">
        <thead class="stylecolor word-color">
            <tr>
                <td colspan="11"><b>Năm học: </b>2025-2026  - <b>Học kỳ: </b>HK02</td>
            </tr>
            <tr>
                <th>STT</th>
                <th>Mã lớp học phần</th>
                <th>Tên học phần</th>
                <th>STC</th>
                <th>Mã lớp</th>
                <th>Thứ</th>
                <th width="60">Tiết</th>
                <th>Phòng</th>
                <th>CBGD</th>
                <th>Tuần</th>
                <th>Ghi chú</th>
            </tr>
        </thead>
        <tbody>
                <tr>
                    <td colspan="11">Chưa có thời khóa biểu</td>
                </tr>
        </tbody>
    </table>

`
}

function examEmptyTemplate(): string {
  return `

    <table width="100%" border="1" class="table table-bordered table-responsive" style="overflow-x: scroll">
        <thead class="stylecolor word-color">
            <tr>
                        <th style="vertical-align: middle">STT</th>
                        <th style="width: 100px; vertical-align: middle">Mã học phần</th>
                        <th style="vertical-align: middle">Tên học phần</th>
                        <th style="vertical-align: middle">SBD</th>
                        <th style="vertical-align: middle">Lần thi</th>
                        <th style="vertical-align: middle">Ngày thi</th>
                        <th style="vertical-align: middle">Giờ thi</th>
                        <th style="vertical-align: middle">Phòng thi</th>
                        <th style="vertical-align: middle">Ngày thi<br />(Lần 2) dự kiến</th>
                        <th style="vertical-align: middle">Giờ thi<br />(Lần 2) dự kiến</th>
                        <th style="vertical-align: middle">Hình thức thi</th>
                        <th style="vertical-align: middle">Thời gian làm bài (phút)</th>
                        <th style="vertical-align: middle">Địa điểm</th>
                        <th style="vertical-align: middle">Kỳ thi</th>
                        <th style="vertical-align: middle">Ghi chú</th>
            </tr>
        </thead>
        <tbody>
                <tr>
                    <td colspan="15">Chưa có lịch thi</td>
                </tr>
        </tbody>
    </table>

`
}

// ─── study variants ─────────────────────────────────────────────────────────

function generateStudyAllTimeSlots(): string {
  const rows = ALL_TIME_SLOTS.map((slot, i) =>
    studyRow(i + 1, WEEKDAYS[i % 7], slot, 'CS3.F.01.01', 'GV A', '01,02,03,04,05,06,07,08,09,10')
  ).join('\n')
  return studyTemplate('all-time-slots', '2025-2026', 'HK01', rows)
}

function generateStudyAllWeekdays(): string {
  const rows = WEEKDAYS.map((day, i) =>
    studyRow(i + 1, day, '1 - 3', 'CS3.F.01.01', 'GV A', '01,02,03,04,05,06,07,08,09,10')
  ).join('\n')
  return studyTemplate('all-weekdays', '2025-2026', 'HK01', rows)
}

function generateStudyWeekPatterns(): string {
  const rows = WEEK_PATTERNS.map((wp, i) =>
    studyRow(i + 1, WEEKDAYS[i % 7], '1 - 3', 'CS3.F.01.01', 'GV A', wp.weeks)
  ).join('\n')
  return studyTemplate('week-patterns', '2025-2026', 'HK01', rows)
}

function generateStudyMissingFields(): string {
  const rows = [
    studyRow(1, 'Hai', '1 - 3', 'CS3.F.01.01', 'Nguyễn Văn A', '01,02,03,04,05,06,07,08,09,10'),
    studyRow(2, 'Ba', '4 - 6', 'CS3.F.01.01', '', '01,02,03,04,05,06,07,08,09,10'),
    studyRow(3, 'Tư', '7 - 9', '', 'GV B', '01,02,03,04,05,06,07,08,09,10'),
    studyRow(4, 'Năm', '10 - 12', '', '', '01,02,03,04,05,06,07,08,09,10'),
  ].join('\n')
  return studyTemplate('missing-fields', '2025-2026', 'HK01', rows)
}

function generateStudyDuplicateRows(): string {
  const rows = `
        <tr>
            <td style="text-align:center">1</td>
            <td style="text-align:center">251_71TEST00001_01</td>
            <td>Lập trình ứng dụng di động</td>
            <td style="text-align:center">3</td>
            <td>71K30CNTT01</td>
            <td style="text-align:center"> Năm</td>
            <td style="text-align:center">4 - 6</td>
            <td style="text-align:center">CS2.A.05.08</td>
            <td>Trần Công Thanh</td>
            <td>02,03,04,05,06,07,08,09,10,11</td>
            <td></td>
        </tr>
        <tr>
            <td style="text-align:center">2</td>
            <td style="text-align:center">251_71TEST00002_01</td>
            <td>Cấu trúc dữ liệu</td>
            <td style="text-align:center">3</td>
            <td>71K30CNTT01</td>
            <td style="text-align:center"> Bảy</td>
            <td style="text-align:center">1 - 2</td>
            <td style="text-align:center">CS3.F.03.06</td>
            <td>Nguyễn Văn B</td>
            <td>01,02,03,04,05,06,07,08,09,10</td>
            <td></td>
        </tr>`
  return studyTemplate('duplicate-rows', '2025-2026', 'HK01', rows)
}

function generateStudySingleCellRow(): string {
  return `

    <table width="100%" border="1" class="table table-bordered">
        <thead class="stylecolor word-color">
            <tr>
                <td colspan="11"><b>Năm học: </b>2025-2026  - <b>Học kỳ: </b>HK01</td>
            </tr>
            <tr>
                <th>STT</th>
                <th>Mã lớp học phần</th>
                <th>Tên học phần</th>
                <th>STC</th>
                <th>Mã lớp</th>
                <th>Thứ</th>
                <th width="60">Tiết</th>
                <th>Phòng</th>
                <th>CBGD</th>
                <th>Tuần</th>
                <th>Ghi chú</th>
            </tr>
        </thead>
        <tbody>
                <tr>
                    <td colspan="11">Không có lớp học nào</td>
                </tr>
        </tbody>
    </table>

`
}

function generateStudyVariousRooms(): string {
  const rows = ROOM_VARIANTS.map((room, i) =>
    studyRow(i + 1, WEEKDAYS[i % 7], '1 - 3', room, `GV ${String.fromCharCode(65 + i)}`, '01,02,03,04,05,06,07,08,09,10')
  ).join('\n')
  return studyTemplate('various-rooms', '2025-2026', 'HK01', rows)
}

function generateStudyTimeSlotWhitespace(): string {
  const edges = [
    { slot: '1-2', desc: 'no-space' },
    { slot: '1 -2', desc: 'missing-after-dash' },
    { slot: '1- 2', desc: 'missing-before-dash' },
    { slot: ' 1 - 2 ', desc: 'extra-outer-space' },
    { slot: '1   -   2', desc: 'extra-inner-space' },
  ]
  const rows = edges.map((e, i) =>
    studyRow(i + 1, WEEKDAYS[i % 7], e.slot, 'CS3.F.01.01', `GV ${e.desc}`, '01,02,03,04,05,06,07,08,09,10')
  ).join('\n')
  return studyTemplate('time-slot-whitespace', '2025-2026', 'HK01', rows)
}

function generateStudyMixedTypes(): string {
  // Mixed study + exam-like entries in study table (simulating various data)
  const rows = [
    studyRow(1, 'Hai', '1 - 3', 'CS3.F.01.01', 'Nguyễn Văn A', '01,02,03,04,05,06,07,08,09,10'),
    studyRow(2, 'Ba', '4 - 6', 'E-LEARNING', 'GV B', '21'),
    studyRow(3, 'Tư', '7 - 9', 'MS-TEAMS', '', '01,02,03,04,05,06,07,08,09,10'),
    studyRow(4, 'Năm', '10 - 12', '', '', ''),
    studyRow(5, 'Sáu', '1 - 2', 'CS3.F.01.01', 'GV D', '01,03,05,07,09'),
  ].join('\n')
  return studyTemplate('mixed-types', '2025-2026', 'HK01', rows)
}

// ─── exam variants ──────────────────────────────────────────────────────────

function generateExamVariousTimes(): string {
  const times = ['07g00', '07g30', '13g30', '18g30', '07g', '13:30', '7h00']
  const rows = times.map((t, i) =>
    examRow(i + 1, `24171TEST${String(i + 1).padStart(5, '0')}`, `Môn thi ${i + 1}`,
      '', 'Lần 1', `${i + 1}/11/2025`, t, 'ONLINE.101',
      'Không', '', 'Trắc nghiệm', '60', 'ONLINE',
      'THI KẾT THÚC HỌC PHẦN', '')
  ).join('\n')
  return examTemplate('various-times', '2025-2026', 'HK01', rows)
}

function generateExamVariousFormats(): string {
  const formats = [
    { hinhThuc: 'Trắc nghiệm', thoiGian: '60', diaDiem: 'ONLINE' },
    { hinhThuc: 'Thực hành/Thí nghiệm_Phòng máy tính', thoiGian: '90', diaDiem: 'Cơ sở 3' },
    { hinhThuc: 'Tiểu luận_nhóm (có TT)', thoiGian: '', diaDiem: 'ONLINE' },
    { hinhThuc: 'Vấn đáp', thoiGian: '10', diaDiem: 'Cơ sở 3' },
    { hinhThuc: 'Bài tập lớn (có TT)', thoiGian: '', diaDiem: '' },
    { hinhThuc: 'Viết_Trắc nghiệm', thoiGian: '75', diaDiem: 'Cơ sở 3' },
  ]
  const rows = formats.map((f, i) =>
    examRow(i + 1, `24171TEST${String(i + 1).padStart(5, '0')}`, `Môn thi ${i + 1}`,
      '', 'Lần 1', `${i + 1}/12/2025}`, '13g30', '',
      'Không', '', f.hinhThuc, f.thoiGian, f.diaDiem,
      'THI KẾT THÚC HỌC PHẦN', '')
  ).join('\n')
  return examTemplate('various-formats', '2025-2026', 'HK01', rows)
}

function generateExamSecondAttempt(): string {
  const rows = [
    examRow(1, '24171TEST00001_01', 'Lập trình ứng dụng di động',
      '', 'Lần 1', '25/11/2025', '18g30', 'ONLINE.101',
      'Không', '', 'Tiểu luận_nhóm (có TT)', '', 'ONLINE',
      'THI KẾT THÚC HỌC PHẦN', ''),
    examRow(2, '24171TEST00002_01', 'Phân tích và thiết kế hệ thống',
      '', 'Lần 1', '26/11/2025', '13g30', 'CS3.F.12.04',
      '10/12/2025', '13g30', 'Thực hành', '90', 'Cơ sở 3',
      'THI KẾT THÚC HỌC PHẦN', ''),
    examRow(3, '24171TEST00003_01', 'Cấu trúc dữ liệu',
      'K30_001', 'Lần 2', '30/12/2025', '07g00', 'CS3.F.08.04',
      'Không', '', 'Viết', '75', 'Cơ sở 3',
      'THI KẾT THÚC HỌC PHẦN', 'Cấm thi'),
  ].join('\n')
  return examTemplate('second-attempt', '2025-2026', 'HK01', rows)
}

function generateExamMissingFields(): string {
  const rows = [
    examRow(1, '24171TEST00001_01', 'Môn thi đầy đủ',
      'K30_001', 'Lần 1', '25/11/2025', '18g30', 'ONLINE.101',
      'Không', '', 'Trắc nghiệm', '60', 'ONLINE',
      'THI KẾT THÚC HỌC PHẦN', ''),
    examRow(2, '24171TEST00002_01', 'Thiếu SBD',
      '', 'Lần 1', '26/11/2025', '13g30', 'CS3.F.12.04',
      '', '', 'Thực hành', '90', 'Cơ sở 3',
      'THI KẾT THÚC HỌC PHẦN', ''),
    examRow(3, '24171TEST00003_01', 'Thiếu giờ thi',
      '', 'Lần 1', '27/11/2025', '', 'ONLINE.102',
      'Không', '', 'Tiểu luận', '', 'ONLINE',
      'THI KẾT THÚC HỌC PHẦN', ''),
    examRow(4, '24171TEST00004_01', 'Thiếu ngày thi',
      '', 'Lần 1', '', '07g00', 'CS3.F.01.01',
      'Không', '', 'Viết', '75', 'Cơ sở 3',
      'THI KẾT THÚC HỌC PHẦN', ''),
  ].join('\n')
  return examTemplate('missing-fields', '2025-2026', 'HK01', rows)
}

function generateExamLocations(): string {
  const locations = [
    { phong: 'ONLINE.101', diaDiem: 'ONLINE' },
    { phong: 'CS3.F.02.04', diaDiem: 'Cơ sở 3' },
    { phong: 'CS3.F.12.04', diaDiem: 'Cơ sở 3' },
    { phong: 'CS2.A.05.08', diaDiem: 'Cơ sở 2' },
    { phong: '', diaDiem: '' },
    { phong: 'Phòng máy 1', diaDiem: 'Cơ sở 3' },
  ]
  const rows = locations.map((loc, i) =>
    examRow(i + 1, `24171TEST${String(i + 1).padStart(5, '0')}`, `Môn thi ${i + 1}`,
      '', 'Lần 1', `${i + 1}/11/2025}`, '13g30', loc.phong,
      'Không', '', 'Thực hành', '60', loc.diaDiem,
      'THI KẾT THÚC HỌC PHẦN', '')
  ).join('\n')
  return examTemplate('various-locations', '2025-2026', 'HK01', rows)
}

// ─── main ───────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

  const variants: [string, string][] = [
    // Study
    ['vlu-study-empty', studyEmptyTemplate()],
    ['vlu-study-empty-alt', generateStudySingleCellRow()],
    ['vlu-study-all-time-slots', generateStudyAllTimeSlots()],
    ['vlu-study-all-weekdays', generateStudyAllWeekdays()],
    ['vlu-study-week-patterns', generateStudyWeekPatterns()],
    ['vlu-study-missing-fields', generateStudyMissingFields()],
    ['vlu-study-duplicate-rows', generateStudyDuplicateRows()],
    ['vlu-study-various-rooms', generateStudyVariousRooms()],
    ['vlu-study-time-slot-whitespace', generateStudyTimeSlotWhitespace()],
    ['vlu-study-mixed-types', generateStudyMixedTypes()],
    // Exam
    ['vlu-exam-empty', examEmptyTemplate()],
    ['vlu-exam-various-times', generateExamVariousTimes()],
    ['vlu-exam-various-formats', generateExamVariousFormats()],
    ['vlu-exam-second-attempt', generateExamSecondAttempt()],
    ['vlu-exam-missing-fields', generateExamMissingFields()],
    ['vlu-exam-various-locations', generateExamLocations()],
  ]

  let count = 0
  for (const [name, html] of variants) {
    const filepath = join(OUT, `${name}.html`)
    writeFileSync(filepath, html, 'utf8')
    console.log(`  ${name}.html  (${html.length} bytes)`)
    count++
  }

  console.log(`\nGenerated ${count} variant files in ${OUT}`)
}

main()
