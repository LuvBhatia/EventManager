package com.campus.EventInClubs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EventInClubsApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventInClubsApplication.class, args);
	}

}
