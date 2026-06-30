package com.finshield.service;

import com.finshield.model.ApplicationEvent;
import com.finshield.model.LoanApplication;
import com.finshield.repository.ApplicationEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationEventService {

    @Autowired
    private ApplicationEventRepository applicationEventRepository;

    @Transactional
    public void logEvent(LoanApplication application, ApplicationEvent.EventType eventType, String description) {
        ApplicationEvent event = new ApplicationEvent();
        event.setLoanApplication(application);
        event.setEventType(eventType);
        event.setDescription(description);
        applicationEventRepository.save(event);
    }
}
