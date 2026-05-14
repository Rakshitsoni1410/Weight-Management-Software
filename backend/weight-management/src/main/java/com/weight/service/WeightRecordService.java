package com.weight.weight_management.service;
import com.weight.weight_management.entity.WeightRecord;
import com.weight.weight_management.repository.WeightRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WeightRecordService {

    private final WeightRecordRepository repository;

    public WeightRecordService(WeightRecordRepository repository) {
        this.repository = repository;
    }

    public List<WeightRecord> getAllRecords() {
        return repository.findAll();
    }

    public WeightRecord addRecord(WeightRecord record) {
        return repository.save(record);
    }

    public WeightRecord updateRecord(Long id, WeightRecord updatedRecord) {

        WeightRecord record = repository.findById(id).orElseThrow();

        record.setDate(updatedRecord.getDate());
        record.setInputWeight(updatedRecord.getInputWeight());
        record.setOutputWeight(updatedRecord.getOutputWeight());

        return repository.save(record);
    }

    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
}