package com.email.email_writer.models;
import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
}