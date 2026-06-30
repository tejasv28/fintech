package com.finshield.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

@RestController
@RequestMapping("/mock/credit-bureau")
public class MockCreditBureauController {

    private final Random random = new Random();

    @GetMapping("/{email}")
    public Integer getMockCreditScore(@PathVariable String email) throws InterruptedException {
        // Simulate network delay occasionally
        if (random.nextInt(10) > 8) {
            Thread.sleep(6000); // Exceeds 5000ms read timeout
        }
        
        // Generate random score between 300 and 850
        return 300 + random.nextInt(551);
    }
}
