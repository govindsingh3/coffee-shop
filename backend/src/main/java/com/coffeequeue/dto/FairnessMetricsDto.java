package com.coffeequeue.dto;

import java.util.Map;

public class FairnessMetricsDto {
    private double fairnessScore;
    private Map<String, Integer> skipCounts;
    private Map<String, Long> violationsByBarista;
    
    public FairnessMetricsDto() {}
    
    public FairnessMetricsDto(double fairnessScore, Map<String, Integer> skipCounts, Map<String, Long> violationsByBarista) {
        this.fairnessScore = fairnessScore;
        this.skipCounts = skipCounts;
        this.violationsByBarista = violationsByBarista;
    }
    
    public double getFairnessScore() { return fairnessScore; }
    public void setFairnessScore(double fairnessScore) { this.fairnessScore = fairnessScore; }
    
    public Map<String, Integer> getSkipCounts() { return skipCounts; }
    public void setSkipCounts(Map<String, Integer> skipCounts) { this.skipCounts = skipCounts; }
    
    public Map<String, Long> getViolationsByBarista() { return violationsByBarista; }
    public void setViolationsByBarista(Map<String, Long> violationsByBarista) { this.violationsByBarista = violationsByBarista; }
}
