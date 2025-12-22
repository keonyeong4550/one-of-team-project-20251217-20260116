package com.desk.service;

import com.desk.dto.MemberDTO;
import com.desk.dto.PageRequestDTO;
import com.desk.dto.PageResponseDTO;

import java.util.List;

public interface AdminService {
    List<MemberDTO> getPendingMembers();
    PageResponseDTO<MemberDTO> getActiveMembers(PageRequestDTO pageRequestDTO);
    void approveMember(String email);
    void deleteMember(String email);
}