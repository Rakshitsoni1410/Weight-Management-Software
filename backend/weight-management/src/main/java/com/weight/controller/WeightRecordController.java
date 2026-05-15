package com.weight.weight_management.controller;

import com.weight.weight_management.entity.WeightRecord;
import com.weight.weight_management.service.WeightRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@CrossOrigin("*")
public class WeightRecordController {

    private final WeightRecordService service;

    public WeightRecordController(WeightRecordService service) {
        this.service = service;
    }

    @GetMapping
    public List<WeightRecord> getAllRecords() {
        return service.getAllRecords();
    }

    @PostMapping
    public WeightRecord addRecord(@RequestBody WeightRecord record) {
        return service.addRecord(record);
    }

    @PutMapping("/{id}")
    public WeightRecord updateRecord(@PathVariable Long id, @RequestBody WeightRecord record) {
        return service.updateRecord(id, record);
    }

    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable Long id) {
        service.deleteRecord(id);
    }

    // 🔥 TEST ENDPOINT (VERY IMPORTANT FOR DEBUG)
    @GetMapping("/test")
    public String test() {
        return "API WORKING";
    }
}