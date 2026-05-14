package com.weight.weight_management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "weight_records")
public class WeightRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;

    private String karatType;

    private Double inputWeight;

    private Double outputWeight;

    // ✅ Optional (recommended): store calculated field in DB too
    private Double differenceWeight;

    public WeightRecord() {
    }

    // 🔥 AUTO CALCULATE BEFORE SAVE
    @PrePersist
    @PreUpdate
    public void calculateDifference() {
        if (inputWeight == null) inputWeight = 0.0;
        if (outputWeight == null) outputWeight = 0.0;

        this.differenceWeight = inputWeight - outputWeight;
    }

    // GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getKaratType() {
        return karatType;
    }

    public void setKaratType(String karatType) {
        this.karatType = karatType;
    }

    public Double getInputWeight() {
        return inputWeight;
    }

    public void setInputWeight(Double inputWeight) {
        this.inputWeight = inputWeight;
    }

    public Double getOutputWeight() {
        return outputWeight;
    }

    public void setOutputWeight(Double outputWeight) {
        this.outputWeight = outputWeight;
    }

    public Double getDifferenceWeight() {
        return differenceWeight;
    }

    public void setDifferenceWeight(Double differenceWeight) {
        this.differenceWeight = differenceWeight;
    }
}