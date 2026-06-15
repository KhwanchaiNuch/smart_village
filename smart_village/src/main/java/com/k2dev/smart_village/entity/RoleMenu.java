package com.k2dev.smart_village.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "role_menu")
public class RoleMenu {

    @EmbeddedId
    private RoleMenuId id;

    @Column(name = "can_view")
    private Boolean canView = false;

    @Column(name = "can_add")
    private Boolean canAdd = false;

    @Column(name = "can_edit")
    private Boolean canEdit = false;

    @Column(name = "can_delete")
    private Boolean canDelete = false;

    public RoleMenu() {}

    public RoleMenu(Long roleId, Long menuId,
                    Boolean canView, Boolean canAdd, Boolean canEdit, Boolean canDelete) {
        this.id = new RoleMenuId(roleId, menuId);
        this.canView    = canView    != null && canView;
        this.canAdd     = canAdd     != null && canAdd;
        this.canEdit    = canEdit    != null && canEdit;
        this.canDelete  = canDelete  != null && canDelete;
    }

    public RoleMenuId getId() { return id; }
    public void setId(RoleMenuId id) { this.id = id; }

    public Long getRoleId() { return id != null ? id.getRoleId() : null; }
    public Long getMenuId() { return id != null ? id.getMenuId() : null; }

    public Boolean getCanView()   { return canView;   }
    public Boolean getCanAdd()    { return canAdd;    }
    public Boolean getCanEdit()   { return canEdit;   }
    public Boolean getCanDelete() { return canDelete; }

    public void setCanView(Boolean canView)     { this.canView   = canView;   }
    public void setCanAdd(Boolean canAdd)       { this.canAdd    = canAdd;    }
    public void setCanEdit(Boolean canEdit)     { this.canEdit   = canEdit;   }
    public void setCanDelete(Boolean canDelete) { this.canDelete = canDelete; }
}
