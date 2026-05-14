function buildRow(cells: string[]) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
}

export const emptySchedule = `<table><tbody></tbody></table>`

export const singleCellRow = `<table><tbody>${buildRow(['only one cell'])}</tbody></table>`

export const studyRowMissingFields = `<table><tbody>${buildRow(['', '', 'Missing Fields', '', '', '', '', '', '', ''])}</tbody></table>`

export const studyRowInvalidTimeSlot = `<table><tbody>${buildRow(['', '', 'Invalid Time', '', '', 'Hai', '99 - 100', 'A101', 'Teacher A', '1,2', ''])}</tbody></table>`

export const studyRowInvalidWeek = `<table><tbody>${buildRow(['', '', 'Invalid Week', '', '', 'Hai', '1 - 2', 'A101', 'Teacher A', 'abc,xyz', ''])}</tbody></table>`

export const studyRowEmptyWeekList = `<table><tbody>${buildRow(['', '', 'Empty Week', '', '', 'Hai', '1 - 2', 'A101', 'Teacher A', '', ''])}</tbody></table>`

export const examRowMissingDate = `<table><tbody>${buildRow(['1', 'Ca 1', 'No Date', 'CODE01', 'Thi', '', '7g30', 'A101', '', ''])}</tbody></table>`

export const examRowMissingTime = `<table><tbody>${buildRow(['1', 'Ca 1', 'No Time', 'CODE01', 'Thi', '20/12/2025', '', 'A101', '', ''])}</tbody></table>`

export const examRowMissingSubject = `<table><tbody>${buildRow(['1', 'Ca 1', '', 'CODE01', 'Thi', '20/12/2025', '7g30', 'A101', '', ''])}</tbody></table>`

export const multiWeekStudyWithLocationChange = `<table><tbody>${buildRow(['', '', 'Multi Loc', '', '', 'Hai', '1 - 2', 'A101', 'Teacher A', '1,2', ''])}</tbody></table>`

export const studyWithNonConsecutiveWeeks = `<table><tbody>${buildRow(['', '', 'Skip Weeks', '', '', 'Tư', '7 - 9', 'B201', 'Teacher B', '2,4,6,8,10', ''])}</tbody></table>`

export const malformedHtml = `this is not html at all <%%>`

export const tableWithoutTbody = `<table><tr><td>1</td><td></td><td>Direct Row</td><td></td><td></td><td>Hai</td><td>1 - 2</td><td>A101</td><td>Teacher</td><td>1</td><td></td></tr></table>`

export const extraWhitespaceFields = `<table><tbody>${buildRow(['', '', '  Lập Trình  Web  ', '', '', '  Hai  ', '  1 - 3  ', '  A.101  ', '  Nguyễn Văn A  ', '  1,2,3  ', '  '])}</tbody></table>`

export const studyCalendarFull = `<!DOCTYPE html>
<html><head><title>Lịch Học</title></head>
<body><div class="container">
<h2>Lịch Học - Học Kỳ 1 - Năm Học 2025-2026</h2>
<table class="table table-bordered table-striped">
<thead><tr><th>STT</th><th>Mã MH</th><th>Tên môn học</th><th>Nhóm</th><th>Tổ hợp</th><th>Thứ</th><th>Tiết</th><th>Phòng</th><th>Giảng viên</th><th>Tuần</th><th>Ghi chú</th></tr></thead>
<tbody>
${buildRow(['1', 'MATH101', 'Toán Cao Cấp', '01', '', 'Hai', '1 - 3', 'A.101', 'Nguyễn Văn A', '1,2,3,4,5', ''])}
${buildRow(['2', 'MATH101', 'Toán Cao Cấp', '01', '', 'Năm', '1 - 3', 'A.101', 'Nguyễn Văn A', '1,2,3,4,5', ''])}
</tbody></table></div></body></html>`

export const examCalendarFull = `<!DOCTYPE html>
<html><head><title>Lịch Thi</title></head>
<body><div class="container">
<h2>Lịch Thi - Học Kỳ 1 - Năm Học 2025-2026</h2>
<table class="table table-bordered table-striped">
<thead><tr><th>STT</th><th>Ca thi</th><th>Tên môn học</th><th>Mã MH</th><th>Hình thức</th><th>Ngày thi</th><th>Giờ thi</th><th>Phòng</th><th>Hội đồng</th><th>Ghi chú</th></tr></thead>
<tbody>
${buildRow(['1', 'Ca 1', 'Toán Cao Cấp', 'MATH101', 'Thi tập trung', '15/12/2025', '7g30', 'H.101', 'HĐ1', ''])}
${buildRow(['2', 'Ca 2', 'Lập Trình Web', 'PROG201', 'Thi thực hành', '18/12/2025', '9g00', 'P.201', 'HĐ2', 'Mang theo laptop'])}
</tbody></table></div></body></html>`
