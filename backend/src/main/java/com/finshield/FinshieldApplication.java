package com.finshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinshieldApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinshieldApplication.class, args);
	}

}
