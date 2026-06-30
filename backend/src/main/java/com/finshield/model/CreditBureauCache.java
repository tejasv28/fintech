package com.finshield.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "credit_bureau_cache")
public class CreditBureauCache {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String applicantEmail;

    @Column(nullable = false)
    private Integer creditScore;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fetchedAt;
}
