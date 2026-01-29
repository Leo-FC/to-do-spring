package com.lfc.aligntodo.service;

import com.lfc.aligntodo.model.Project;
import com.lfc.aligntodo.model.User;
import com.lfc.aligntodo.model.enums.ProfileEnum;
import com.lfc.aligntodo.model.projection.ProjectProjection;
import com.lfc.aligntodo.repository.ProjectRepository;
import com.lfc.aligntodo.security.UserSpringSecurity;
import com.lfc.aligntodo.service.exceptions.AuthorizationException;
import com.lfc.aligntodo.service.exceptions.DataBindingViolationException;
import com.lfc.aligntodo.service.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class ProjectService {

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    public Project findById(Long id){
        Project project = projectRepository.findById(id).orElseThrow(() -> new ObjectNotFoundException("Project not found"));

        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity) || !userSpringSecurity.hasRole(ProfileEnum.ADMIN) && !userHasProject(userSpringSecurity, project)){
            throw new AuthorizationException("Acesso negado");
        }

        return project;
    }

    @Transactional(readOnly = true)
    public List<ProjectProjection> findAllByUser(){
        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity)){
            throw new AuthorizationException("Acesso negado");
        }

        List<ProjectProjection> projects = projectRepository.findByUser_Id(userSpringSecurity.getId());
        return projects;
    }

    @Transactional
    public Project create(Project obj){

        UserSpringSecurity userSpringSecurity = UserService.authenticated();

        if(Objects.isNull(userSpringSecurity)){
            throw new AuthorizationException("Acesso negado");
        }

        User user = userService.findById(userSpringSecurity.getId());

        obj.setId(null);
        obj.setUser(user);

        return projectRepository.save(obj);
    }

    @Transactional
    public Project update(Project obj){

        Project newObj = findById(obj.getId());

        newObj.setName(obj.getName());
        newObj.setDescription(obj.getDescription());

        return projectRepository.save(newObj);
    }

    @Transactional
    public void delete(Long id){

        findById(id);
        try{
            projectRepository.deleteById(id);
        }catch(Exception e){
            throw new DataBindingViolationException("Nao foi possivel deletar");
        }

    }


    private Boolean userHasProject(UserSpringSecurity userSpringSecurity, Project project){
        return project.getUser().getId().equals(userSpringSecurity.getId());
    }
}
