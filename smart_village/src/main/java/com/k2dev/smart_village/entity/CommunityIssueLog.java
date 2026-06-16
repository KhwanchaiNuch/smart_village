package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_issue_log")
public class CommunityIssueLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long issueId;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(length = 50)
    private String status;

    @Column(length = 500)
    private String remark1;

    @Column(length = 500)
    private String remark2;

    @Column(length = 500)
    private String remark3;

    @Column(length = 500)
    private String remark4;

    @Column(length = 500)
    private String remark5;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemark1() { return remark1; }
    public void setRemark1(String remark1) { this.remark1 = remark1; }

    public String getRemark2() { return remark2; }
    public void setRemark2(String remark2) { this.remark2 = remark2; }

    public String getRemark3() { return remark3; }
    public void setRemark3(String remark3) { this.remark3 = remark3; }

    public String getRemark4() { return remark4; }
    public void setRemark4(String remark4) { this.remark4 = remark4; }

    public String getRemark5() { return remark5; }
    public void setRemark5(String remark5) { this.remark5 = remark5; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
