CREATE UNIQUE INDEX reports_reporter_reported_pending_unique
  ON reports (reporter_user_id, reported_user_id)
  WHERE status = 'pending';
