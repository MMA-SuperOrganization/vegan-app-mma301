export function postStatusLabel(status: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    draft: ['Bản nháp', 'Draft'],
    pending_review: ['Chờ duyệt', 'Pending review'],
    published: ['Đã đăng', 'Published'],
    rejected: ['Bị từ chối', 'Rejected'],
    archived: ['Đã lưu trữ', 'Archived'],
    hidden: ['Đã ẩn', 'Hidden'],
    deleted: ['Đã xóa', 'Deleted'],
    open: ['Mới', 'Open'],
    reviewing: ['Đang xem xét', 'Reviewing'],
    resolved: ['Đã xử lý', 'Resolved'],
    dismissed: ['Đã bác bỏ', 'Dismissed'],
  };
  return labels[status]?.[vi ? 0 : 1] || status;
}
