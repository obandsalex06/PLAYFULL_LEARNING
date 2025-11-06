-- Tabla para notas y observaciones académicas
CREATE TABLE IF NOT EXISTS academic_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  teacher_email VARCHAR(255) NOT NULL,
  grade DECIMAL(5,2) NOT NULL,
  observations TEXT,
  evaluation_type VARCHAR(100) NOT NULL,
  evaluation_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_email) REFERENCES teachers(email)
);