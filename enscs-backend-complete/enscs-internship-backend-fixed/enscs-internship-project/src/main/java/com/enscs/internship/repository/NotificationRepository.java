package com.enscs.internship.repository;

import com.enscs.internship.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByRecipientIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.recipient.id = :userId")
    void markAsRead(Long id, Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :userId")
    void markAllAsRead(Long userId);
}
