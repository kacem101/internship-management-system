package com.enscs.internship.repository;

import com.enscs.internship.entity.CompanyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyContactRepository extends JpaRepository<CompanyContact, Long> {
    List<CompanyContact> findByCompanyId(Long companyId);
    Optional<CompanyContact> findByEmail(String email);
}