package com.weight.weight_management.repository;

import com.weight.weight_management.entity.WeightRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeightRecordRepository extends JpaRepository<WeightRecord, Long> {

}