package com.wildsight.backend.dto;


import lombok.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementResponse {


    private Long totalUsers;


    private Long admins;


    private Long researchers;


    private Long forestOfficers;


    private Long volunteers;


}